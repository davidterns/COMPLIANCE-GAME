// All game text — edit this file to customise for each client
const GAME_CONTENT = {

  meta: {
    title:   'ÉTICA & COMPLIANCE',
    subtitle:'Misión: Certificación',
    company: ''
  },

  principles: [
    {
      name:     'Brújula de Transparencia',
      creature: 'CRISTAL',
      skill:    'Auditoría Visual',
      desc:     'Elimina una respuesta incorrecta'
    },
    {
      name:     'Brújula de Integridad',
      creature: 'VALOR',
      skill:    'Escudo de Valores',
      desc:     'Falla sin perder HP una vez'
    },
    {
      name:     'Brújula de Prudencia',
      creature: 'SABIO',
      skill:    'Análisis de Riesgos',
      desc:     'Muestra una pista de la respuesta'
    }
  ],

  intro: {
    professorName: 'Prof. Oak',
    dialogs: [
      '¡Hola! Te doy la bienvenida al mundo\nde la Integridad Corporativa. Mi\nnombre es Profesor Oak... de Compliance.',
      'Este mundo está lleno de decisiones\ncomplejas. Para asegurar que nuestra\nempresa sobreviva, debemos seguir las\nreglas del juego: el Código Ético.',
      'Pero antes de salir, necesitas una\nbrújula. Acércate a la mesa y elige\nuno de estos tres Principios Iniciales.'
    ],
    choicePrompt: '¿Qué principio eliges?',
    afterChoice: [
      '¡Excelente elección! Tu principio\nte guiará en los combates.',
      'Sal ahí fuera. En Pueblo Paleta\nÉtico hay 3 Gimnasios. ¡Derrota a\nsus líderes y certifícate!'
    ]
  },

  npcs: [
    // NPC 0 — near Gym 1 (IA)
    '¡Ten cuidado con Ada! Te preguntará\npor datos de IA. Recuerda: que los\ndatos estén en internet NO significa\nque puedas usarlos comercialmente.',
    // NPC 1 — near Gym 2 (Anticorrupción)
    'Silvia es muy estricta con los\nfuncionarios. Un café a un funcionario\npúblico puede ser cohecho.\n¡Con privados las reglas son distintas!',
    // NPC 2 — near Gym 3 (Competencia)
    'Carlos vigila las ferias del sector.\nSi un competidor habla de "repartirse\nclientes", lo ético es irte inmediato\ny reportarlo. Callarse te hace cómplice.'
  ],

  gyms: [
    {
      id: 0,
      name: 'Gimnasio de la IA',
      leader: 'Ada',
      intro: '¡La tecnología avanza más rápido\nque las leyes! Demuéstrame que sabes\nusar los algoritmos con ética\no tu sistema colapsará.',
      win:  '¡Increíble! Has demostrado que la\nIA debe ser ética. Te mereces\n',
      lose: 'Necesitas saber más sobre IA\nética. ¡Habla con los ciudadanos\nantes de volver!',
      badgeName: 'Medalla Algoritmo',
      questions: [
        {
          text: 'Queremos entrenar una IA con datos\nprotegidos encontrados en una web\npública. ¿Qué hacemos?',
          options: [
            'No usarlos sin licencia o permiso\nexplícito del autor.',
            'Usarlos. Al estar en internet\npúblico son libres.',
            'Usarlos citando al autor en los\ntérminos de servicio.'
          ],
          correct: 0,
          hint: 'El acceso público no otorga\nlicencia de uso comercial.'
        },
        {
          text: 'El algoritmo de selección rechaza\nautomáticamente al 90% de las\ncandidatas mujeres. ¿Cómo respondes?',
          options: [
            'Pausar el sistema, auditar los\ndatos y corregir el sesgo.',
            'Confiar en la IA; si lo decide\nes porque es más eficiente.',
            'Dejarlo correr y cubrir\nlas vacantes manualmente.'
          ],
          correct: 0,
          hint: 'Un sistema sesgado perpetúa\ndiscriminación. Hay que auditarlo.'
        },
        {
          text: 'Un cliente pide borrar sus datos\npero tu IA los necesita para\npredecir patrones. ¿Qué prima?',
          options: [
            'El Derecho al Olvido: elimínalos\no anonimízalos irreversiblemente.',
            'El interés del negocio; la IA\nes prioritaria para la estrategia.',
            'Mantenerlos en una base oculta\nque la IA pueda leer en secreto.'
          ],
          correct: 0,
          hint: 'El RGPD ampara el derecho al\nolvido sobre el interés comercial.'
        },
        {
          text: 'Vas a usar una IA generativa\nexternal para redactar un informe\nconfidencial. ¿Cómo actúas?',
          options: [
            'No introduces datos confidenciales\nni secretos comerciales en el prompt.',
            'Metes todo; las cláusulas\nde estas webs siempre son seguras.',
            'Cambias los nombres y subes\nel resto del informe confidencial.'
          ],
          correct: 0,
          hint: 'Los datos que introduces en IAs\nexternas pueden usarse para entrenarlas.'
        },
        {
          text: '¿Quién es el responsable último\nsi una IA causa un perjuicio\nfinanciero a un cliente?',
          options: [
            'La empresa y los humanos que\nimplementaron y supervisaron la IA.',
            'El desarrollador externo que\nprogramó el código del modelo.',
            'Nadie; se considera un error\ntécnico inevitable o fuerza mayor.'
          ],
          correct: 0,
          hint: 'Las decisiones automatizadas\ntienen siempre un responsable humano.'
        }
      ]
    },

    {
      id: 1,
      name: 'Gimnasio Anticorrupción',
      leader: 'Silvia',
      intro: 'Un regalo por aquí, un favor\npor allá... ¡Así empiezan los\ngrandes fraudes! Veamos si sabes\nmantener las manos limpias.',
      win:  '¡Manos limpias! Has demostrado\nconocer los límites del soborno.\nTe mereces la ',
      lose: 'Aún tienes dudas sobre regalos\ny conflictos. ¡Habla con los\nciudadanos y vuelve más fuerte!',
      badgeName: 'Medalla Integridad',
      questions: [
        {
          text: 'Un proveedor te envía un reloj de\nlujo a casa "para celebrar la buena\nrelación" antes de una licitación.\n¿Qué haces?',
          options: [
            'Rechazarlo y reportarlo al\ndepartamento de Compliance.',
            'Aceptarlo; no afectará tu\ndecisión final en la licitación.',
            'Quedártelo y donarlo a la\ntómbola de Navidad.'
          ],
          correct: 0,
          hint: 'Un regalo antes de una licitación\nes siempre un intento de influencia.'
        },
        {
          text: 'Para agilizar un permiso atascado,\nun funcionario pide una "tasa de\nfacilitación" en efectivo sin\nrecibo. ¿Qué haces?',
          options: [
            'Negarte; los pagos de facilitación\nson sobornos ilegales.',
            'Pagarlo; es práctica común en\nese municipio para agilizar.',
            'Pedirle a un gestor externo\nque lo pague para no implicarte.'
          ],
          correct: 0,
          hint: 'No existe el "soborno menor".\nCualquier pago sin factura es ilegal.'
        },
        {
          text: 'Un cliente privado te invita a un\npalco VIP de fútbol de coste\nrazonable dentro de la política\nde cortesía de la empresa.',
          options: [
            'Revisar la política de hospitalidad,\nregistrarlo y asistir si es legítimo.',
            'Rechazarlo; está prohibido\naceptar cualquier interacción social.',
            'Ir sin avisar a nadie; si es\nprivado no hay regulación.'
          ],
          correct: 0,
          hint: 'La clave es la política interna\ny el registro transparente.'
        },
        {
          text: 'Descubres que un compañero infla\nlos gastos de viaje para obtener\ndinero extra. Te pide que no\ndigas nada.',
          options: [
            'Usar el Canal de Denuncias\ninterno de forma confidencial.',
            'No decir nada; es un asunto\npersonal que no te afecta.',
            'Amenazarle con decírselo al\njefe si no comparte el dinero.'
          ],
          correct: 0,
          hint: 'El silencio ante el fraude\ntambién es una forma de complicidad.'
        },
        {
          text: '¿Cuál de estas situaciones es un\nConflicto de Intereses directo\nque debes declarar?',
          options: [
            'Que la empresa competidora por\nun contrato sea de tu hermano.',
            'Que el director proveedor sea\nde tu mismo equipo de fútbol.',
            'Que un proveedor haya trabajado\nen la empresa hace diez años.'
          ],
          correct: 0,
          hint: 'Un vínculo familiar directo\nsiempre requiere declaración.'
        }
      ]
    },

    {
      id: 2,
      name: 'Gimnasio de Competencia',
      leader: 'Carlos',
      intro: '¡El mercado es una guerra y yo\njuego a ganar! ¿Tienes el valor\nde competir limpiamente o vas\na hacer trampas?',
      win:  '¡Competencia limpia! Conoces las\nreglas del mercado libre y ético.\nTe mereces la ',
      lose: 'El derecho de la competencia\nes complejo. ¡Aprende más con\nlos ciudadanos y vuelve!',
      badgeName: 'Medalla Mercado',
      questions: [
        {
          text: 'En un congreso un competidor\nte propone fijar un precio mínimo\ncomún para no perder margen.\n¿Qué haces?',
          options: [
            'Rechazar, abandonar la conversación\ny reportarlo a Legal.',
            'Escuchar y decir que lo\nestudiarás con la dirección.',
            'Aceptar el pacto de palabra;\nsin escrito el regulador no lo sabrá.'
          ],
          correct: 0,
          hint: 'Incluso escuchar sin responder\npuede comprometerte legalmente.'
        },
        {
          text: 'Un candidato de tu competidor\nofrece revelar su estrategia\nde precios en la entrevista.\n¿Cómo actúas?',
          options: [
            'Detener la entrevista, rechazar\nla información y avisar a Compliance.',
            'Escuchar la información y luego\ndecidir si le contratas.',
            'Contratarlo exclusivamente para\nimplementar su estrategia.'
          ],
          correct: 0,
          hint: 'Usar secretos comerciales ajenos\nes espionaje industrial.'
        },
        {
          text: 'Tu empresa es líder de mercado\ny bajas precios por debajo de\ncostes para arruinar a un\ncompetidor local.',
          options: [
            'Es ilegal: precios predatorios\ny abuso de posición de dominio.',
            'Es legal; el libre mercado\npermite bajar precios sin límite.',
            'Es legal si vuelves a subir\nlos precios al mes siguiente.'
          ],
          correct: 0,
          hint: 'El abuso de posición dominante\nestá prohibido, incluso bajando precios.'
        },
        {
          text: 'Redactas un email sobre estrategia\ncomercial. ¿Qué frase deberías\nevitar para no generar riesgos\nlegales?',
          options: [
            '"Vamos a sacar del mercado a X\ncon esta estrategia ilegal."',
            '"Nuestro objetivo es captar más\ncuota de mercado de forma ética."',
            '"Debemos mejorar la eficiencia\nde costes para ser competitivos."'
          ],
          correct: 0,
          hint: 'Los emails son evidencia judicial.\nEvita lenguaje que sugiera ilegalidad.'
        },
        {
          text: 'En una asociación profesional se\ndebate repartir zonas geográficas\nentre las empresas socias.\n¿Qué haces?',
          options: [
            'Constar en acta tu disconformidad,\nmarcharte y reportarlo.',
            'Quedarte callado sin votar\npara no comprometerte.',
            'Participar si a tu empresa\nle toca la mejor zona.'
          ],
          correct: 0,
          hint: 'El reparto de mercados es\niegal aunque sea "consensuado".'
        }
      ]
    }
  ],

  victory: {
    dialogs: [
      '¡Increíble! Has derrotado a los\ntres maestros y demostrado una\ncultura ética impecable.',
      'Tu brújula de principio es ahora\nmás fuerte. Has completado la\nformación con éxito.',
      '¡Enhorabuena! Tu certificación\nde Ética y Compliance ha sido\nregistrada en el sistema.'
    ]
  }
};
