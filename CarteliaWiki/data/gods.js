const heraldDefinition = "Описание пока не добавлено.";

const godPantheons = {
    indigenous: {
        name: "Исконные",
        categories: {
            senior: {
                name: "Старшие боги",
                label: "Старший бог",
                definition: "Старшие боги Картелии отвечают за фундаментальные и/или абсолютные концепции. Способны перестраивать реальность под свои желания. Несмотря на то, что каждый бог берёт на себя одну абсолютную концепцию, (Материя, Время, Пространство) но на самом деле они способны взять на себя все концепции и быть вполне независимыми. Они прямые дети Этофира, созданные для его кормления. "
            },
            junior: {
                name: "Младшие боги",
                label: "Младший бог",
                definition: "Младшие боги Картелии созданы старшими и отвечают за неизбежные коцепции в рамках одного мира. В мире Картелии это Жизнь, Смерть и Душа. Созданы для круговорота души и поддержания барьера защищающего Картелию от Этофира. Младшие могут перестраивать реальность, но только в пределах своих владений (Со-гат, До-гат, Ро-гат) "
            },
            demigod: {
                name: "Полубоги",
                label: "Полубог",
                definition: ""
            },
            heraldKitil: {
                name: "Вестники Китиля",
                label: "Вестник Китиля",
                definition: heraldDefinition
            },
            heraldIbel: {
                name: "Вестники Ибеля",
                label: "Вестник Ибеля",
                definition: heraldDefinition
            },
            heraldAlimesa: {
                name: "Вестники Алимесы",
                label: "Вестник Алимесы",
                definition: heraldDefinition
            }
        }
    },
    foreign: {
        name: "Чужеродные",
        categories: {
            equalsSeniors: {
                name: "Созданные Этофиром",
                label: "Созданный Этофиром",
                definition: ""
            },
            createdByFaceless: {
                name: "Созданные Безликим",
                label: "Созданный Безликим",
                definition: ""
            },
            createdByAvelmar: {
                name: "Созданные Авельмаром",
                label: "Созданный Авельмаром",
                definition: ""
            }
        }
    }
};

const gods = {

    markart: {
        name: "Маркарт",
        title: "Бог материи",
        pantheon: "indigenous",
        category: "senior",
        image: "images/carts of gods/markart.png",
        description: "Здесь будет подробное описание Маркарта."
    },

    zirkif: {
        name: "Зиркиф",
        title: "Бог времени",
        pantheon: "indigenous",
        category: "senior",
        image: "images/carts of gods/zirkif.png",
        description: "Здесь будет подробное описание Зиркифа."
    },

    garlas: {
        name: "Гарлас",
        title: "Бог пространства",
        pantheon: "indigenous",
        category: "senior",
        image: "images/carts of gods/Garlas.png",
        description: "Здесь будет подробное описание Гарласа."
    },

    alimesa: {
        name: "Алимеса",
        title: "Богиня души",
        pantheon: "indigenous",
        category: "junior",
        image: "images/carts of gods/Alimesa.png",
        description: "Здесь будет подробное описание Алимесы."
    },

    kitil: {
        name: "Китиль",
        title: "Бог смерти",
        pantheon: "indigenous",
        category: "junior",
        image: "images/carts of gods/Kitil.jpg",
        description: "Здесь будет подробное описание Китиля."
    },

    ibel: {
        name: "Ибель",
        title: "Бог жизни",
        pantheon: "indigenous",
        category: "junior",
        description: "Здесь будет подробное описание Ибеля."
    },

    keket: {
        name: "Кекет",
        pantheon: "indigenous",
        category: "demigod",
        image: "images/carts of gods/Keket.png",
        description: "Праотец демонов."
    },

    alimarkh: {
        name: "Алимарх",
        pantheon: "indigenous",
        category: "demigod",
        description: "Пророк Иаланизма."
    },

    khrait: {
        name: "Храит",
        pantheon: "indigenous",
        category: "demigod",
        description: "Древо смерти."
    },

    mothersOfFellenim: {
        name: "Нэлиаресана, Сэрианелара и Рэлариэсана",
        pantheon: "indigenous",
        category: "demigod",
        description: "Матери Фелленим."
    },

    maidenOfSacrifice: {
        name: "Дева жертвы",
        pantheon: "indigenous",
        category: "heraldKitil",
        description: "Милосердие Китиля."
    },

    sekhem: {
        name: "Секхем",
        pantheon: "indigenous",
        category: "heraldKitil",
        description: "Палач Китиля."
    },

    narberal: {
        name: "Нарберал",
        pantheon: "indigenous",
        category: "heraldKitil",
        description: "Судья Китиля."
    },

    heraldIbel1: {
        name: "Вестник 1",
        pantheon: "indigenous",
        category: "heraldIbel"
    },

    heraldIbel2: {
        name: "Вестник 2",
        pantheon: "indigenous",
        category: "heraldIbel"
    },

    heraldAlimesa1: {
        name: "Вестник 1",
        pantheon: "indigenous",
        category: "heraldAlimesa"
    },

    heraldAlimesa2: {
        name: "Вестник 2",
        pantheon: "indigenous",
        category: "heraldAlimesa"
    },

    faceless: {
        name: "Безликий",
        title: "Бог бездны",
        pantheon: "foreign",
        category: "equalsSeniors",
        description: "Описание пока не добавлено."
    },

    avelmar: {
        name: "Авельмар",
        title: "Бог звёзд",
        pantheon: "foreign",
        category: "equalsSeniors",
        description: "Описание пока не добавлено."
    },

    yahweh: {
        name: "Яхве",
        title: "Бог плоти",
        pantheon: "foreign",
        category: "createdByFaceless",
        description: "Описание пока не добавлено."
    },

    ferncat: {
        name: "Фернкат",
        title: "Бог апокалипсиса",
        pantheon: "foreign",
        category: "createdByFaceless",
        description: "Описание пока не добавлено."
    },

    frida: {
        name: "Фрида",
        title: "Богиня судьбы",
        pantheon: "foreign",
        category: "createdByAvelmar",
        description: "Описание пока не добавлено."
    },

    saretAndZaret: {
        name: "Сарет и Зарет",
        title: "Боги исполнения",
        pantheon: "foreign",
        category: "createdByAvelmar",
        description: "Описание пока не добавлено."
    },

    ethophir: {
        name: "Этофир",
        pantheon: "foreign",
        standalone: true,
        image: "",
        imagePlaceholder: "Изображение пока не добавлено.",
        description: ""
    }

};
