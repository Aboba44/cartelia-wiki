const church = {
    branches: {
        silver: {
            name: "Серебряная ветвь",
            description: "Ветвь доблести, истины и упокоения.",

            chambers: {
                rest: {
                    name: "Палаты Упокоения",
                    description: "Здесь будет описание Палат Упокоения.",
                    topics: []
                },

                valor: {
                    name: "Палата Доблести",
                    description: "Здесь будет описание Палаты Доблести.",
                    topics: [
                        {
                            name: "Святые ордена",
                            type: "orders"
                        },
                        {
                            name: "Регулярная армия",
                            type: "text"
                        }
                    ]
                },

                truth: {
                    name: "Палата Истины",
                    description: "Здесь будет описание Палаты Истины.",
                    topics: [
                        {
                            name: "Судебная система",
                            type: "text"
                        },
                        {
                            name: "Законодательство",
                            type: "text"
                        },
                        {
                            name: "Инквизиция",
                            type: "text"
                        }
                    ]
                }
            }
        },

        gold: {
            name: "Золотая ветвь",
            description: "Здесь будет описание Золотой ветви.",
            chambers: {}
        },

        azure: {
            name: "Лазурная ветвь",
            description: "Здесь будет описание Лазурной ветви.",
            chambers: {}
        }
    }
};