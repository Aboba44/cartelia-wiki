const raceBelongings = {
    ibel: {
        name: "Ибель",
        description: "Существа, принадлежащие Ибелю.",
        categories: {
            sentient: {
                name: "Разумные",
                description: "Разумные существа, принадлежащие Ибелю.",
                races: ["fellenim", "darbols", "merkots", "humans"]
            },
            semi: {
                name: "Полуразумные",
                description: "Категория пока не проработана.",
                races: []
            },
            animals: {
                name: "Неразумные",
                description: "Животные и другие неразумные существа.",
                races: []
            }
        }
    },

    kitil: {
        name: "Китиль",
        description: "Нежить и прочие существа, принадлежащие Китилю.",
        categories: {
            rotting: {
                name: "Гниющие",
                description: "Категория нежити.",
                races: []
            },
            bloodsucking: {
                name: "Кровососущие",
                description: "Категория нежити.",
                races: []
            },
            dark: {
                name: "Сотканные из тьмы",
                description: "Категория нежити.",
                races: []
            }
        }
    },

    ash: {
        name: "Пепел",
        description: "Существа, принадлежащие Пеплу.",
        categories: {}
    }
};

const races = {
    fellenim: {
        name: "Фелленим",
        belonging: "ibel",
        description: "Разумная раса, принадлежащая Ибелю.",
        notes: "Описание пока не добавлено."
    },
    darbols: {
        name: "Дарболы",
        belonging: "ibel",
        description: "Разумная раса, принадлежащая Ибелю.",
        notes: "Описание пока не добавлено."
    },
    merkots: {
        name: "Меркоты",
        belonging: "ibel",
        description: "Разумная раса, принадлежащая Ибелю.",
        notes: "Описание пока не добавлено."
    },
    humans: {
        name: "Люди",
        belonging: "ibel",
        description: "Разумная раса, принадлежащая Ибелю.",
        notes: "Народы людей подразделяются на многочисленные и малочисленные."
    }
};
