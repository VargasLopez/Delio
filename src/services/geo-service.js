/**
 * Mexico Postal Code (CP) Lookup Service
 * Combines a free public ZIP API (Zippopotam.us) with a robust local offline CP fallback dictionary.
 */

// Local fallback dictionary for popular Mexican CP zones (ideal for offline PWA simulation)
const LOCAL_CP_DICTIONARY = {
  "03100": {
    stateCode: "CDMX",
    stateName: "Ciudad de México",
    municipality: "Benito Juárez",
    colonias: ["Narvarte", "Del Valle", "Nápoles", "Portales"]
  },
  "06700": {
    stateCode: "CDMX",
    stateName: "Ciudad de México",
    municipality: "Cuauhtémoc",
    colonias: ["Roma Norte", "Condesa", "Centro", "Doctores"]
  },
  "11560": {
    stateCode: "CDMX",
    stateName: "Ciudad de México",
    municipality: "Miguel Hidalgo",
    colonias: ["Polanco", "Anzures", "Lomas de Chapultepec"]
  },
  "04000": {
    stateCode: "CDMX",
    stateName: "Ciudad de México",
    municipality: "Coyoacán",
    colonias: ["Del Carmen", "Coyoacán Centro", "Copilco"]
  },
  "64000": {
    stateCode: "NL",
    stateName: "Nuevo León",
    municipality: "Monterrey",
    colonias: ["Centro", "Obispado", "San Jerónimo", "Tecnológico"]
  },
  "66220": {
    stateCode: "NL",
    stateName: "Nuevo León",
    municipality: "San Pedro Garza García",
    colonias: ["Valle Oriente", "Colonia Del Valle", "Chipinque"]
  },
  "44100": {
    stateCode: "JAL",
    stateName: "Jalisco",
    municipality: "Guadalajara",
    colonias: ["Americana", "Providencia", "Centro", "Chapalita"]
  },
  "45010": {
    stateCode: "JAL",
    stateName: "Jalisco",
    municipality: "Zapopan",
    colonias: ["Puerta de Hierro", "Ciudad del Sol", "Las Águilas"]
  },
  "76000": {
    stateCode: "QRO",
    stateName: "Querétaro",
    municipality: "Santiago de Querétaro",
    colonias: ["Centro", "Juriquilla", "El Refugio", "Milenio III"]
  },
  "53100": {
    stateCode: "EDOMEX",
    stateName: "Estado de México",
    municipality: "Naucalpan de Juárez",
    colonias: ["Ciudad Satélite", "Lomas Verdes", "Echegaray"]
  }
};

// Maps Zippopotam state names to our internal geo-data state keys
const STATE_NAME_MAP = {
  "distrito federal": "CDMX",
  "ciudad de méxico": "CDMX",
  "nuevo león": "NL",
  "jalisco": "JAL",
  "querétaro": "QRO",
  "queretaro": "QRO",
  "méxico": "EDOMEX",
  "mexico": "EDOMEX",
  "estado de méxico": "EDOMEX"
};

export const GeoService = {
  /**
   * Looks up geographical details for a 5-digit Mexican postal code.
   * @param {string} cp - 5-digit postal code
   * @returns {Promise<{stateCode: string, stateName: string, municipality: string, colonias: string[]}|null>}
   */
  async lookupPostalCode(cp) {
    const cleanCp = cp.trim();
    if (!/^\d{5}$/.test(cleanCp)) return null;

    try {
      console.log(`[GeoService] Looking up CP ${cleanCp}...`);
      
      // 1. Try querying the free public API
      // Zippopotam.us provides a highly reliable, zero-auth public MX endpoint
      const response = await fetch(`https://api.zippopotam.us/mx/${cleanCp}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.places && data.places.length > 0) {
          const rawState = data.places[0]["state"].toLowerCase();
          const stateCode = STATE_NAME_MAP[rawState] || "CDMX"; // Fallback to CDMX if not matched
          
          // Zippopotam returns place names as colonias/locations
          // We can group all places matching this CP to form the list of colonias
          const colonias = data.places.map(place => place["place name"]);
          
          // Get municipality from the first place entry
          // Usually Zippopotam uses state/place, sometimes municipality is in place name or we can extract
          // For Benito Juárez, etc. Zippopotam places usually list the exact sub-district.
          // Let's resolve clean municipal locations
          const rawMuni = data.places[0]["place name"]; // Use first place name as sample
          const municipality = data.places[0]["place name"].split('(')[0].trim();

          return {
            stateCode,
            stateName: data.places[0]["state"],
            municipality: municipality,
            colonias: colonias
          };
        }
      }
    } catch (apiError) {
      console.warn("[GeoService] Zippopotam API call failed, falling back to local dictionary.", apiError);
    }

    // 2. Fallback to Local Offline CP Dictionary
    if (LOCAL_CP_DICTIONARY[cleanCp]) {
      console.log(`[GeoService] Local fallback match for CP ${cleanCp}`);
      return LOCAL_CP_DICTIONARY[cleanCp];
    }

    return null;
  }
};
