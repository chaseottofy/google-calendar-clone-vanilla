function adjustColorHue(colorObject, hueShift) {
  function hexToHSL(hex) {
    const r = (Number.parseInt(hex.slice(1, 3), 16)) / 255;
    const g = (Number.parseInt(hex.slice(3, 5), 16)) / 255;
    const b = (Number.parseInt(hex.slice(5, 7), 16)) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = ((max + min) / 2);

    if (max !== min) {
      const d = (max - min);
      s = (l > 0.5) ? (d / (2 - max - min)) : (d / (max + min));
      switch (max) {
        case r: {
          h = ((g - b) / d) + ((g < b) ? 6 : 0);
          break;
        }
        case g: {
          h = ((b - r) / d) + 2;
          break;
        }
        case b: {
          h = ((r - g) / d) + 4;
          break;
        }
        default: {
          break;
        }
      }
      h /= 6;
    }

    return [(h * 360), (s * 100), (l * 100)];
  }

  // Helper function to convert HSL to hex
  function hslToHex(h, s, l) {
    const lScaled = (l / 100);
    const a = (s * Math.min(lScaled, 1 - lScaled)) / 100;
    const f = (n) => {
      const k = ((n + h / 30) % 12);
      const color = (lScaled - a * Math.max(Math.min(k - 3, 9 - k, 1), -1));
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  // Main function to adjust hue
  function adjustHue(hex, hueShift) {
    const [h, s, l] = hexToHSL(hex);
    const newHue = ((h + hueShift) % 360);
    return hslToHex(newHue, s, l);
  }

  // Deep clone the color object
  const newColorObject = structuredClone(colorObject);

  // Iterate through the color object and adjust hues
  for (const colorCategory in newColorObject) {
    for (const shade in newColorObject[colorCategory]) {
      newColorObject[colorCategory][shade] = adjustHue(newColorObject[colorCategory][shade], hueShift);
    }
  }

  return newColorObject;
}

export default adjustColorHue;
