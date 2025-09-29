// Função para gerar cores complementares baseadas na cor principal
 export const generateComplementaryColors = (baseColor = '#229ad2') => {
    // Converte a cor base para HSL
    const hexToHsl = (hex:string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return [h * 360, s * 100, l * 100];
    };

    // Converte HSL para hex
    const hslToHex = (h: number, s: number, l: number) => {
      h /= 360;
      s /= 100;
      l /= 100;
      
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((h * 6) % 2 - 1));
      const m = l - c / 2;
      let r = 0, g = 0, b = 0;

      if (0 <= h && h < 1/6) {
        r = c; g = x; b = 0;
      } else if (1/6 <= h && h < 1/3) {
        r = x; g = c; b = 0;
      } else if (1/3 <= h && h < 1/2) {
        r = 0; g = c; b = x;
      } else if (1/2 <= h && h < 2/3) {
        r = 0; g = x; b = c;
      } else if (2/3 <= h && h < 5/6) {
        r = x; g = 0; b = c;
      } else if (5/6 <= h && h <= 1) {
        r = c; g = 0; b = x;
      }

      const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
      const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
      const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');
      
      return `#${rHex}${gHex}${bHex}`;
    };

    const [h, s, l] = hexToHsl(baseColor);
    
    // Gera cores complementares em diferentes ângulos do círculo cromático
    return [
      baseColor,                    // Cor original
      hslToHex((h + 120) % 360, s, l),  // 120° - Verde
      hslToHex((h + 60) % 360, s, l),   // 60° - Amarelo
      hslToHex((h + 300) % 360, s, l),  // 300° - Rosa
      hslToHex((h + 90) % 360, s, l),   // 90° - Verde-amarelado
      hslToHex((h + 240) % 360, s, l),  // 240° - Roxo
    ];
  };