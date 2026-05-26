/**
 * Mexico Geodata Dictionary for Localized Errands & Jobs in Delio
 * Features states, major municipalities, and standard colonias.
 */
export const MEXICO_GEO_DATA = {
  "CDMX": {
    name: "Ciudad de México",
    municipalities: {
      "Benito Juárez": ["Narvarte", "Del Valle", "Nápoles", "Portales", "Mixcoac", "San José Insurgentes"],
      "Cuauhtémoc": ["Roma Norte", "Condesa", "Centro", "Doctores", "Juárez", "Santa María la Ribera"],
      "Miguel Hidalgo": ["Polanco", "Anzures", "Lomas de Chapultepec", "Tacubaya", "Escandón", "Pensil"],
      "Coyoacán": ["Del Carmen", "Villa de Cortés", "Coyoacán Centro", "Pedregal de Carrasco", "Copilco"]
    }
  },
  "NL": {
    name: "Nuevo León",
    municipalities: {
      "Monterrey": ["Centro", "Obispado", "San Jerónimo", "Mitras Centro", "Tecnológico", "Colinas de San Jerónimo"],
      "San Pedro Garza García": ["Valle Oriente", "Colonia Del Valle", "Chipinque", "Lomas del Valle", "San Agustín"],
      "Guadalupe": ["Linda Vista", "Contry", "Centro de Guadalupe", "La Fama"]
    }
  },
  "JAL": {
    name: "Jalisco",
    municipalities: {
      "Guadalajara": ["Americana", "Providencia", "Centro", "Chapalita", "Ladrón de Guevara", "Oblatos"],
      "Zapopan": ["Puerta de Hierro", "Ciudad del Sol", "Las Águilas", "Valle Real", "Constitución"]
    }
  },
  "QRO": {
    name: "Querétaro",
    municipalities: {
      "Santiago de Querétaro": ["Juriquilla", "Centro", "El Refugio", "Milenio III", "Carretas", "Tejeda"]
    }
  },
  "EDOMEX": {
    name: "Estado de México",
    municipalities: {
      "Naucalpan de Juárez": ["Ciudad Satélite", "Lomas Verdes", "Echegaray", "Tecamachalco"],
      "Tlalnepantla de Baz": ["Valle Dorado", "Arboledas", "Centro Tlalnepantla", "Viveros de la Loma"],
      "Ecatepec de Morelos": ["Las Américas", "Ciudad Azteca", "San Cristóbal Centro"]
    }
  }
};

/**
 * Returns a flattened array of all states.
 */
export function getStates() {
  return Object.entries(MEXICO_GEO_DATA).map(([code, data]) => ({
    code,
    name: data.name
  }));
}

/**
 * Returns municipalities for a given state code.
 */
export function getMunicipalities(stateCode) {
  if (!MEXICO_GEO_DATA[stateCode]) return [];
  return Object.keys(MEXICO_GEO_DATA[stateCode].municipalities);
}

/**
 * Returns colonias for a state and municipality.
 */
export function getColonias(stateCode, municipality) {
  if (!MEXICO_GEO_DATA[stateCode]) return [];
  if (!MEXICO_GEO_DATA[stateCode].municipalities[municipality]) return [];
  return MEXICO_GEO_DATA[stateCode].municipalities[municipality];
}
