import QRCode from 'qrcode';

export class QRCodeService {
  async generateQRCode(
    url: string,
    options: {
      format?: 'png' | 'svg';
      size?: number;
      darkColor?: string;
      lightColor?: string;
    } = {}
  ): Promise<string | Buffer> {
    const { format = 'png', size = 300, darkColor = '#000000', lightColor = '#ffffff' } = options;

    const qrOptions = {
      width: size,
      margin: 2,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    };

    if (format === 'svg') {
      return await QRCode.toString(url, { ...qrOptions, type: 'svg' });
    }

    return await QRCode.toBuffer(url, { ...qrOptions, type: 'png' });
  }
}
