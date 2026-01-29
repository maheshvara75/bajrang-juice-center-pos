
import { SaleRecord } from '../types';
import { STORE_DETAILS } from '../constants';

export class PrinterService {
  // Fix: Using 'any' as BluetoothDevice is not defined in the current environment
  private device: any | null = null;
  // Fix: Using 'any' as BluetoothRemoteGATTCharacteristic is not defined in the current environment
  private characteristic: any | null = null;

  async connect(): Promise<boolean> {
    try {
      // Fix: Cast navigator to any to access the experimental bluetooth property
      // Standard UUIDs for most Bluetooth Thermal Printers
      this.device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });

      const server = await this.device.gatt?.connect();
      const service = await server?.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristics = await service?.getCharacteristics();
      
      // Usually the first characteristic that supports "write"
      this.characteristic = characteristics?.find((c: any) => c.properties.write) || null;
      
      return !!this.characteristic;
    } catch (error) {
      console.error('Bluetooth Connection Error:', error);
      return false;
    }
  }

  async printReceipt(sale: SaleRecord, paperWidth: '58mm' | '80mm'): Promise<void> {
    if (!this.characteristic) throw new Error('Printer not connected');

    const encoder = new TextEncoder();
    const esc = {
      init: [0x1B, 0x40],
      alignCenter: [0x1B, 0x61, 0x01],
      alignLeft: [0x1B, 0x61, 0x00],
      boldOn: [0x1B, 0x45, 0x01],
      boldOff: [0x1B, 0x45, 0x00],
      feed: [0x0A],
      cut: [0x1D, 0x56, 0x42, 0x00]
    };

    const commands: number[] = [];
    const charLimit = paperWidth === '58mm' ? 32 : 48;

    const addText = (text: string) => commands.push(...Array.from(encoder.encode(text + '\n')));
    const addRaw = (bytes: number[]) => commands.push(...bytes);

    // Initializing
    addRaw(esc.init);
    addRaw(esc.alignCenter);
    addRaw(esc.boldOn);
    addText(STORE_DETAILS.name);
    addRaw(esc.boldOff);
    addText(STORE_DETAILS.tagline);
    addText(STORE_DETAILS.address);
    addText(`GSTIN: ${STORE_DETAILS.gstin}`);
    addText("-".repeat(charLimit));

    addRaw(esc.alignLeft);
    addText(`Bill: ${sale.billNo}`);
    addText(`Date: ${new Date(sale.timestamp).toLocaleDateString()} ${new Date(sale.timestamp).toLocaleTimeString()}`);
    addText("-".repeat(charLimit));

    // Items
    sale.items.forEach(item => {
      const name = item.name.substring(0, charLimit - 12);
      const price = (item.price * item.quantity).toFixed(2);
      const line = `${name.padEnd(charLimit - 12)} ${item.quantity} ${price.padStart(8)}`;
      addText(line);
    });

    addText("-".repeat(charLimit));
    addText(`SUBTOTAL: ${sale.subtotal.toFixed(2).padStart(charLimit - 10)}`);
    addText(`GST(5%):  ${sale.gst.toFixed(2).padStart(charLimit - 10)}`);
    addRaw(esc.boldOn);
    addText(`TOTAL:    ₹${sale.total.toFixed(2).padStart(charLimit - 11)}`);
    addRaw(esc.boldOff);
    addText("-".repeat(charLimit));

    addRaw(esc.alignCenter);
    addText("Payment: " + sale.paymentMethod);
    addText("");
    addText("Thank You! 😊");
    addText("Visit Again!");
    addRaw(esc.feed);
    addRaw(esc.feed);
    addRaw(esc.feed);
    addRaw(esc.cut);

    // Send in chunks (some printers have small buffers)
    const chunkSize = 20;
    for (let i = 0; i < commands.length; i += chunkSize) {
      await this.characteristic.writeValue(new Uint8Array(commands.slice(i, i + chunkSize)));
    }
  }

  isConnected(): boolean {
    return !!this.characteristic;
  }
}

export const printerService = new PrinterService();
