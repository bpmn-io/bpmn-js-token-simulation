/**
 * German `translate` service used by the i18n specs.
 *
 * Some translations deliberately contain characters that are meaningful in
 * HTML and in CSS attribute selectors (quotes, ampersands, angle brackets)
 * to cover that translations are rendered as text, not as markup.
 */
const translations = {
  'Token Simulation': 'Token "Simulation" & <Co>',
  'Play/Pause Simulation': 'Abspielen & "Pausieren"',
  'Reset Simulation': 'Zurücksetzen & "neu"',
  'Toggle Simulation Log': 'Protokoll "anzeigen" & <b>fett</b>',
  'Set animation speed = {speed}': 'Tempo "festlegen" & <b>los</b> = {speed}',
  'Slow': 'Langsam & "träge"',
  'Normal': 'Normal',
  'Fast': 'Schnell',
  '{name} started': '{name} "gestartet" & <b>los</b>'
};

export default {
  translate: [ 'value', function(template, replacements = {}) {

    const translated = translations[template] || template;

    return translated.replace(/{([^}]+)}/g, (_, key) => {
      return key in replacements ? replacements[key] : '{' + key + '}';
    });
  } ]
};
