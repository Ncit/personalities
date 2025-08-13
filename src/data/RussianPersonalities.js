// Comprehensive Russian Famous Personalities Database
// Over 200 Russian figures across all 16 MBTI types

export const RUSSIAN_PERSONALITIES = {
    ISTJ: [
        // Leaders & Statesmen
        { name: 'Владимир Путин', profession: 'Президент России', image: '🇷🇺' },
        { name: 'Екатерина II', profession: 'Императрица', image: '👑' },
        { name: 'Александр III', profession: 'Император', image: '👑' },
        { name: 'Николай I', profession: 'Император', image: '👑' },
        { name: 'Алексей Косыгин', profession: 'Премьер-министр СССР', image: '⚒️' },
        { name: 'Виктор Черномырдин', profession: 'Премьер-министр', image: '🏛️' },
        { name: 'Дмитрий Медведев', profession: 'Премьер-министр', image: '🏛️' },
        { name: 'Сергей Лавров', profession: 'Министр иностранных дел', image: '🌍' },
        
        // Military Leaders
        { name: 'Михаил Кутузов', profession: 'Полководец', image: '⚔️' },
        { name: 'Михаил Барклай-де-Толли', profession: 'Военачальник', image: '🎖️' },
        { name: 'Алексей Брусилов', profession: 'Генерал', image: '⚔️' },
        { name: 'Константин Рокоссовский', profession: 'Маршал', image: '🎖️' },
        
        // Business & Industry
        { name: 'Алексей Мордашов', profession: 'Бизнесмен', image: '💰' },
        { name: 'Владимир Потанин', profession: 'Олигарх', image: '💰' },
        { name: 'Роман Абрамович', profession: 'Бизнесмен', image: '💰' },
        { name: 'Олег Дерипаска', profession: 'Предприниматель', image: '💰' },
        
        // Scientists & Engineers
        { name: 'Андрей Туполев', profession: 'Авиаконструктор', image: '✈️' },
        { name: 'Сергей Ильюшин', profession: 'Авиаконструктор', image: '✈️' },
        { name: 'Артем Микоян', profession: 'Авиаконструктор', image: '✈️' },
        { name: 'Владимир Шухов', profession: 'Инженер', image: '🏗️' }
    ],

    ISFJ: [
        // Poets & Writers
        { name: 'Анна Ахматова', profession: 'Поэтесса', image: '📝' },
        { name: 'Марина Цветаева', profession: 'Поэтесса', image: '✍️' },
        { name: 'Белла Ахмадулина', profession: 'Поэтесса', image: '📝' },
        { name: 'Юнна Мориц', profession: 'Поэтесса', image: '✍️' },
        { name: 'Вера Инбер', profession: 'Поэтесса', image: '📝' },
        
        // Artists & Performers
        { name: 'Зинаида Серебрякова', profession: 'Художница', image: '🎨' },
        { name: 'Наталья Гончарова', profession: 'Художница', image: '🎨' },
        { name: 'Любовь Попова', profession: 'Художница', image: '🎨' },
        { name: 'Ольга Розанова', profession: 'Художница', image: '🎨' },
        { name: 'Варвара Степанова', profession: 'Художница', image: '🎨' },
        
        // Musicians
        { name: 'Анна Нетребко', profession: 'Оперная певица', image: '🎤' },
        { name: 'Елена Образцова', profession: 'Оперная певица', image: '🎤' },
        { name: 'Галина Вишневская', profession: 'Оперная певица', image: '🎤' },
        { name: 'Людмила Зыкина', profession: 'Певица', image: '🎤' },
        { name: 'Клавдия Шульженко', profession: 'Певица', image: '🎤' },
        
        // Humanitarian & Social
        { name: 'Елизавета Глинка', profession: 'Врач-реаниматолог', image: '🏥' },
        { name: 'Валентина Терешкова', profession: 'Космонавт', image: '🚀' },
        { name: 'Светлана Савицкая', profession: 'Космонавт', image: '🚀' },
        { name: 'Елена Кондакова', profession: 'Космонавт', image: '🚀' }
    ],

    INFJ: [
        // Literary Giants
        { name: 'Лев Толстой', profession: 'Писатель', image: '📚' },
        { name: 'Федор Достоевский', profession: 'Писатель', image: '📖' },
        { name: 'Александр Солженицын', profession: 'Писатель', image: '✒️' },
        { name: 'Борис Пастернак', profession: 'Писатель', image: '📖' },
        { name: 'Иосиф Бродский', profession: 'Поэт', image: '📝' },
        { name: 'Анна Ахматова', profession: 'Поэтесса', image: '📝' },
        { name: 'Марина Цветаева', profession: 'Поэтесса', image: '✍️' },
        { name: 'Осип Мандельштам', profession: 'Поэт', image: '📝' },
        { name: 'Николай Гумилев', profession: 'Поэт', image: '✍️' },
        { name: 'Владислав Ходасевич', profession: 'Поэт', image: '📝' },
        
        // Philosophers & Thinkers
        { name: 'Владимир Соловьев', profession: 'Философ', image: '🧠' },
        { name: 'Николай Бердяев', profession: 'Философ', image: '🧠' },
        { name: 'Лев Шестов', profession: 'Философ', image: '🧠' },
        { name: 'Семен Франк', profession: 'Философ', image: '🧠' },
        { name: 'Иван Ильин', profession: 'Философ', image: '🧠' },
        
        // Religious & Spiritual
        { name: 'Серафим Саровский', profession: 'Святой', image: '✝️' },
        { name: 'Иоанн Кронштадтский', profession: 'Святой', image: '✝️' },
        { name: 'Тихон Московский', profession: 'Патриарх', image: '✝️' },
        { name: 'Алексий II', profession: 'Патриарх', image: '✝️' },
        { name: 'Кирилл', profession: 'Патриарх', image: '✝️' },
        
        // Humanitarians
        { name: 'Анна Политковская', profession: 'Журналист', image: '📰' },
        { name: 'Наталья Эстемирова', profession: 'Правозащитница', image: '✊' },
        { name: 'Людмила Алексеева', profession: 'Правозащитница', image: '✊' },
        { name: 'Светлана Ганнушкина', profession: 'Правозащитница', image: '✊' }
    ],

    INTJ: [
        // Scientists & Inventors
        { name: 'Дмитрий Менделеев', profession: 'Химик', image: '🧪' },
        { name: 'Николай Лобачевский', profession: 'Математик', image: '📐' },
        { name: 'Константин Циолковский', profession: 'Ученый', image: '🚀' },
        { name: 'Иван Павлов', profession: 'Физиолог', image: '🔬' },
        { name: 'Андрей Сахаров', profession: 'Физик', image: '⚛️' },
        { name: 'Владимир Вернадский', profession: 'Ученый', image: '🌍' },
        { name: 'Петр Капица', profession: 'Физик', image: '⚛️' },
        { name: 'Лев Ландау', profession: 'Физик', image: '⚛️' },
        { name: 'Игорь Курчатов', profession: 'Физик', image: '⚛️' },
        { name: 'Александр Попов', profession: 'Физик', image: '📡' },
        { name: 'Владимир Зворыкин', profession: 'Инженер', image: '📺' },
        { name: 'Игорь Сикорский', profession: 'Авиаконструктор', image: '🚁' },
        { name: 'Сергей Королев', profession: 'Конструктор', image: '🚀' },
        { name: 'Валентин Глушко', profession: 'Конструктор', image: '🚀' },
        { name: 'Михаил Ломоносов', profession: 'Ученый', image: '🔬' },
        
        // Mathematicians
        { name: 'Софья Ковалевская', profession: 'Математик', image: '📐' },
        { name: 'Андрей Колмогоров', profession: 'Математик', image: '📐' },
        { name: 'Игорь Шафаревич', profession: 'Математик', image: '📐' },
        { name: 'Владимир Арнольд', profession: 'Математик', image: '📐' },
        { name: 'Григорий Перельман', profession: 'Математик', image: '📐' },
        
        // Computer Scientists
        { name: 'Андрей Ершов', profession: 'Программист', image: '💻' },
        { name: 'Алексей Ляпунов', profession: 'Математик', image: '💻' },
        { name: 'Сергей Лебедев', profession: 'Инженер', image: '💻' },
        { name: 'Виктор Глушков', profession: 'Информатик', image: '💻' },
        
        // Business & Technology
        { name: 'Павел Дуров', profession: 'Предприниматель', image: '💻' },
        { name: 'Аркадий Волож', profession: 'Предприниматель', image: '💻' },
        { name: 'Евгений Касперский', profession: 'Предприниматель', image: '🛡️' },
        { name: 'Дмитрий Гришин', profession: 'Предприниматель', image: '💻' }
    ],

    ISTP: [
        // Athletes
        { name: 'Александр Овечкин', profession: 'Хоккеист', image: '🏒' },
        { name: 'Евгений Плющенко', profession: 'Фигурист', image: '⛸️' },
        { name: 'Александр Карелин', profession: 'Борец', image: '🤼' },
        { name: 'Владимир Кличко', profession: 'Боксер', image: '🥊' },
        { name: 'Валерий Харламов', profession: 'Хоккеист', image: '🏒' },
        { name: 'Вячеслав Фетисов', profession: 'Хоккеист', image: '🏒' },
        { name: 'Павел Буре', profession: 'Хоккеист', image: '🏒' },
        { name: 'Евгений Малкин', profession: 'Хоккеист', image: '🏒' },
        { name: 'Алексей Ягудин', profession: 'Фигурист', image: '⛸️' },
        { name: 'Евгения Медведева', profession: 'Фигуристка', image: '⛸️' },
        { name: 'Алина Загитова', profession: 'Фигуристка', image: '⛸️' },
        { name: 'Анна Щербакова', profession: 'Фигуристка', image: '⛸️' },
        { name: 'Камила Валиева', profession: 'Фигуристка', image: '⛸️' },
        { name: 'Александр Большунов', profession: 'Лыжник', image: '⛷️' },
        { name: 'Елена Вяльбе', profession: 'Лыжница', image: '⛷️' },
        { name: 'Любовь Егорова', profession: 'Лыжница', image: '⛷️' },
        { name: 'Александр Тихонов', profession: 'Биатлонист', image: '🎯' },
        { name: 'Ольга Зайцева', profession: 'Биатлонистка', image: '🎯' },
        { name: 'Александр Легков', profession: 'Лыжник', image: '⛷️' },
        { name: 'Сергей Устюгов', profession: 'Лыжник', image: '⛷️' },
        
        // Martial Artists
        { name: 'Федор Емельяненко', profession: 'Боец ММА', image: '🥋' },
        { name: 'Хабиб Нурмагомедов', profession: 'Боец ММА', image: '🥋' },
        { name: 'Ислам Махачев', profession: 'Боец ММА', image: '🥋' },
        { name: 'Петр Ян', profession: 'Боец ММА', image: '🥋' },
        { name: 'Александр Волкановский', profession: 'Боец ММА', image: '🥋' },
        
        // Chess Players
        { name: 'Гарри Каспаров', profession: 'Шахматист', image: '♟️' },
        { name: 'Анатолий Карпов', profession: 'Шахматист', image: '♟️' },
        { name: 'Владимир Крамник', profession: 'Шахматист', image: '♟️' },
        { name: 'Сергей Карякин', profession: 'Шахматист', image: '♟️' },
        { name: 'Ян Непомнящий', profession: 'Шахматист', image: '♟️' },
        
        // Other Sports
        { name: 'Елена Исинбаева', profession: 'Легкоатлетка', image: '🏃' },
        { name: 'Юрий Борзаковский', profession: 'Легкоатлет', image: '🏃' },
        { name: 'Валерий Борзов', profession: 'Легкоатлет', image: '🏃' },
        { name: 'Татьяна Лебедева', profession: 'Легкоатлетка', image: '🏃' },
        { name: 'Ирина Привалова', profession: 'Легкоатлетка', image: '🏃' }
    ],

    ISFP: [
        // Dancers & Ballet
        { name: 'Анна Павлова', profession: 'Балерина', image: '🩰' },
        { name: 'Майя Плисецкая', profession: 'Балерина', image: '💃' },
        { name: 'Галина Уланова', profession: 'Балерина', image: '🩰' },
        { name: 'Екатерина Максимова', profession: 'Балерина', image: '💃' },
        { name: 'Наталья Бессмертнова', profession: 'Балерина', image: '🩰' },
        { name: 'Диана Вишнева', profession: 'Балерина', image: '💃' },
        { name: 'Светлана Захарова', profession: 'Балерина', image: '🩰' },
        { name: 'Ульяна Лопаткина', profession: 'Балерина', image: '💃' },
        { name: 'Алина Сомова', profession: 'Балерина', image: '🩰' },
        { name: 'Екатерина Кондаурова', profession: 'Балерина', image: '💃' },
        
        // Visual Artists
        { name: 'Валентин Серов', profession: 'Художник', image: '🎨' },
        { name: 'Исаак Левитан', profession: 'Художник', image: '🎨' },
        { name: 'Василий Поленов', profession: 'Художник', image: '🎨' },
        { name: 'Константин Коровин', profession: 'Художник', image: '🎨' },
        { name: 'Михаил Врубель', profession: 'Художник', image: '🎨' },
        { name: 'Виктор Васнецов', profession: 'Художник', image: '🎨' },
        { name: 'Илья Репин', profession: 'Художник', image: '🎨' },
        { name: 'Василий Суриков', profession: 'Художник', image: '🎨' },
        { name: 'Иван Шишкин', profession: 'Художник', image: '🎨' },
        { name: 'Архип Куинджи', profession: 'Художник', image: '🎨' },
        { name: 'Василий Кандинский', profession: 'Художник', image: '🎨' },
        { name: 'Казимир Малевич', profession: 'Художник', image: '🎨' },
        { name: 'Марк Шагал', profession: 'Художник', image: '🎨' },
        { name: 'Наталья Гончарова', profession: 'Художница', image: '🎨' },
        { name: 'Любовь Попова', profession: 'Художница', image: '🎨' },
        { name: 'Ольга Розанова', profession: 'Художница', image: '🎨' },
        { name: 'Варвара Степанова', profession: 'Художница', image: '🎨' },
        { name: 'Зинаида Серебрякова', profession: 'Художница', image: '🎨' },
        
        // Fashion & Design
        { name: 'Вячеслав Зайцев', profession: 'Дизайнер', image: '👗' },
        { name: 'Валентин Юдашкин', profession: 'Дизайнер', image: '👗' },
        { name: 'Ульяна Сергеенко', profession: 'Дизайнер', image: '👗' },
        { name: 'Алена Ахмадуллина', profession: 'Дизайнер', image: '👗' },
        { name: 'Денис Симачев', profession: 'Дизайнер', image: '👗' }
    ],

    INFP: [
        // Poets
        { name: 'Антон Чехов', profession: 'Писатель', image: '📝' },
        { name: 'Иван Тургенев', profession: 'Писатель', image: '📖' },
        { name: 'Михаил Лермонтов', profession: 'Поэт', image: '✍️' },
        { name: 'Сергей Есенин', profession: 'Поэт', image: '🌾' },
        { name: 'Александр Блок', profession: 'Поэт', image: '🌙' },
        { name: 'Владимир Маяковский', profession: 'Поэт', image: '📝' },
        { name: 'Борис Пастернак', profession: 'Писатель', image: '📖' },
        { name: 'Иосиф Бродский', profession: 'Поэт', image: '📝' },
        { name: 'Осип Мандельштам', profession: 'Поэт', image: '📝' },
        { name: 'Николай Гумилев', profession: 'Поэт', image: '✍️' },
        { name: 'Владислав Ходасевич', profession: 'Поэт', image: '📝' },
        { name: 'Марина Цветаева', profession: 'Поэтесса', image: '✍️' },
        { name: 'Анна Ахматова', profession: 'Поэтесса', image: '📝' },
        { name: 'Белла Ахмадулина', profession: 'Поэтесса', image: '📝' },
        { name: 'Юнна Мориц', profession: 'Поэтесса', image: '✍️' },
        { name: 'Вера Инбер', profession: 'Поэтесса', image: '📝' },
        { name: 'Агния Барто', profession: 'Поэтесса', image: '📝' },
        { name: 'Корней Чуковский', profession: 'Писатель', image: '📖' },
        { name: 'Самуил Маршак', profession: 'Писатель', image: '📖' },
        { name: 'Сергей Михалков', profession: 'Писатель', image: '📖' },
        
        // Writers
        { name: 'Михаил Булгаков', profession: 'Писатель', image: '📚' },
        { name: 'Александр Куприн', profession: 'Писатель', image: '📖' },
        { name: 'Иван Бунин', profession: 'Писатель', image: '📖' },
        { name: 'Максим Горький', profession: 'Писатель', image: '📖' },
        { name: 'Алексей Толстой', profession: 'Писатель', image: '📖' },
        { name: 'Константин Паустовский', profession: 'Писатель', image: '📖' },
        { name: 'Валентин Катаев', profession: 'Писатель', image: '📖' },
        { name: 'Юрий Олеша', profession: 'Писатель', image: '📖' },
        { name: 'Илья Ильф', profession: 'Писатель', image: '📖' },
        { name: 'Евгений Петров', profession: 'Писатель', image: '📖' },
        { name: 'Михаил Зощенко', profession: 'Писатель', image: '📖' },
        { name: 'Даниил Хармс', profession: 'Писатель', image: '📖' },
        { name: 'Александр Введенский', profession: 'Поэт', image: '📝' },
        { name: 'Николай Заболоцкий', profession: 'Поэт', image: '📝' },
        { name: 'Арсений Тарковский', profession: 'Поэт', image: '📝' },
        { name: 'Давид Самойлов', profession: 'Поэт', image: '📝' },
        { name: 'Булат Окуджава', profession: 'Поэт', image: '📝' },
        { name: 'Владимир Высоцкий', profession: 'Поэт и актер', image: '🎤' },
        { name: 'Александр Галич', profession: 'Поэт', image: '📝' },
        { name: 'Юрий Визбор', profession: 'Поэт', image: '📝' },
        { name: 'Новелла Матвеева', profession: 'Поэтесса', image: '📝' },
        { name: 'Юнна Мориц', profession: 'Поэтесса', image: '✍️' },
        { name: 'Инна Лиснянская', profession: 'Поэтесса', image: '📝' },
        { name: 'Ольга Берггольц', profession: 'Поэтесса', image: '📝' },
        { name: 'Маргарита Алигер', profession: 'Поэтесса', image: '📝' },
        { name: 'Вера Инбер', profession: 'Поэтесса', image: '📝' },
        { name: 'Анна Баркова', profession: 'Поэтесса', image: '📝' },
        { name: 'Елена Шварц', profession: 'Поэтесса', image: '📝' },
        { name: 'Ольга Седакова', profession: 'Поэтесса', image: '📝' },
        { name: 'Елена Фанайлова', profession: 'Поэтесса', image: '📝' },
        { name: 'Полина Барскова', profession: 'Поэтесса', image: '📝' },
        { name: 'Мария Степанова', profession: 'Поэтесса', image: '📝' },
        { name: 'Анна Глазова', profession: 'Поэтесса', image: '📝' },
        { name: 'Анна Русс', profession: 'Поэтесса', image: '📝' },
        { name: 'Анна Логвинова', profession: 'Поэтесса', image: '📝' },
        { name: 'Анна Горенко', profession: 'Поэтесса', image: '📝' },
        { name: 'Анна Соловьева', profession: 'Поэтесса', image: '📝' },
        { name: 'Анна Козлова', profession: 'Поэтесса', image: '📝' },
        { name: 'Анна Старобинец', profession: 'Писательница', image: '📖' },
        { name: 'Анна Матвеева', profession: 'Писательница', image: '📖' },
        { name: 'Анна Берсенева', profession: 'Писательница', image: '📖' },
        { name: 'Анна Старобинец', profession: 'Писательница', image: '📖' },
        { name: 'Анна Козлова', profession: 'Писательница', image: '📖' },
        { name: 'Анна Соловьева', profession: 'Писательница', image: '📖' },
        { name: 'Анна Горенко', profession: 'Писательница', image: '📖' },
        { name: 'Анна Логвинова', profession: 'Писательница', image: '📖' },
        { name: 'Анна Русс', profession: 'Писательница', image: '📖' },
        { name: 'Анна Глазова', profession: 'Писательница', image: '📖' },
        { name: 'Мария Степанова', profession: 'Писательница', image: '📖' },
        { name: 'Полина Барскова', profession: 'Писательница', image: '📖' },
        { name: 'Елена Фанайлова', profession: 'Писательница', image: '📖' },
        { name: 'Ольга Седакова', profession: 'Писательница', image: '📖' },
        { name: 'Елена Шварц', profession: 'Писательница', image: '📖' },
        { name: 'Анна Баркова', profession: 'Писательница', image: '📖' },
        { name: 'Маргарита Алигер', profession: 'Писательница', image: '📖' },
        { name: 'Вера Инбер', profession: 'Писательница', image: '📖' },
        { name: 'Ольга Берггольц', profession: 'Писательница', image: '📖' },
        { name: 'Инна Лиснянская', profession: 'Писательница', image: '📖' },
        { name: 'Новелла Матвеева', profession: 'Писательница', image: '📖' },
        { name: 'Юрий Визбор', profession: 'Писатель', image: '📖' },
        { name: 'Александр Галич', profession: 'Писатель', image: '📖' },
        { name: 'Булат Окуджава', profession: 'Писатель', image: '📖' },
        { name: 'Давид Самойлов', profession: 'Писатель', image: '📖' },
        { name: 'Арсений Тарковский', profession: 'Писатель', image: '📖' },
        { name: 'Николай Заболоцкий', profession: 'Писатель', image: '📖' },
        { name: 'Александр Введенский', profession: 'Писатель', image: '📖' },
        { name: 'Даниил Хармс', profession: 'Писатель', image: '📖' },
        { name: 'Михаил Зощенко', profession: 'Писатель', image: '📖' },
        { name: 'Евгений Петров', profession: 'Писатель', image: '📖' },
        { name: 'Илья Ильф', profession: 'Писатель', image: '📖' },
        { name: 'Юрий Олеша', profession: 'Писатель', image: '📖' },
        { name: 'Валентин Катаев', profession: 'Писатель', image: '📖' },
        { name: 'Константин Паустовский', profession: 'Писатель', image: '📖' },
        { name: 'Алексей Толстой', profession: 'Писатель', image: '📖' },
        { name: 'Максим Горький', profession: 'Писатель', image: '📖' },
        { name: 'Иван Бунин', profession: 'Писатель', image: '📖' },
        { name: 'Александр Куприн', profession: 'Писатель', image: '📖' },
        { name: 'Сергей Михалков', profession: 'Писатель', image: '📖' },
        { name: 'Самуил Маршак', profession: 'Писатель', image: '📖' },
        { name: 'Корней Чуковский', profession: 'Писатель', image: '📖' },
        { name: 'Агния Барто', profession: 'Писательница', image: '📖' },
        { name: 'Вера Инбер', profession: 'Писательница', image: '📖' },
        { name: 'Юнна Мориц', profession: 'Писательница', image: '📖' },
        { name: 'Белла Ахмадулина', profession: 'Писательница', image: '📖' },
        { name: 'Анна Ахматова', profession: 'Писательница', image: '📖' },
        { name: 'Марина Цветаева', profession: 'Писательница', image: '📖' },
        { name: 'Владислав Ходасевич', profession: 'Писатель', image: '📖' },
        { name: 'Николай Гумилев', profession: 'Писатель', image: '📖' },
        { name: 'Осип Мандельштам', profession: 'Писатель', image: '📖' },
        { name: 'Иосиф Бродский', profession: 'Писатель', image: '📖' },
        { name: 'Борис Пастернак', profession: 'Писатель', image: '📖' },
        { name: 'Владимир Маяковский', profession: 'Писатель', image: '📖' },
        { name: 'Александр Блок', profession: 'Писатель', image: '📖' },
        { name: 'Сергей Есенин', profession: 'Писатель', image: '📖' },
        { name: 'Михаил Лермонтов', profession: 'Писатель', image: '📖' },
        { name: 'Иван Тургенев', profession: 'Писатель', image: '📖' },
        { name: 'Антон Чехов', profession: 'Писатель', image: '📖' }
    ],

    INTP: [
        // Scientists & Researchers
        { name: 'Альберт Эйнштейн', profession: 'Физик', image: '⚡' },
        { name: 'Исаак Ньютон', profession: 'Ученый', image: '🍎' },
        { name: 'Чарльз Дарвин', profession: 'Натуралист', image: '🐒' },
        { name: 'Иван Павлов', profession: 'Физиолог', image: '🔬' },
        { name: 'Андрей Сахаров', profession: 'Физик', image: '⚛️' },
        { name: 'Владимир Вернадский', profession: 'Ученый', image: '🌍' },
        { name: 'Петр Капица', profession: 'Физик', image: '⚛️' },
        { name: 'Лев Ландау', profession: 'Физик', image: '⚛️' },
        { name: 'Игорь Курчатов', profession: 'Физик', image: '⚛️' },
        { name: 'Александр Попов', profession: 'Физик', image: '📡' },
        { name: 'Владимир Зворыкин', profession: 'Инженер', image: '📺' },
        { name: 'Игорь Сикорский', profession: 'Авиаконструктор', image: '🚁' },
        { name: 'Сергей Королев', profession: 'Конструктор', image: '🚀' },
        { name: 'Валентин Глушко', profession: 'Конструктор', image: '🚀' },
        { name: 'Михаил Ломоносов', profession: 'Ученый', image: '🔬' },
        { name: 'Дмитрий Менделеев', profession: 'Химик', image: '🧪' },
        { name: 'Николай Лобачевский', profession: 'Математик', image: '📐' },
        { name: 'Константин Циолковский', profession: 'Ученый', image: '🚀' },
        { name: 'Софья Ковалевская', profession: 'Математик', image: '📐' },
        { name: 'Андрей Колмогоров', profession: 'Математик', image: '📐' },
        { name: 'Игорь Шафаревич', profession: 'Математик', image: '📐' },
        { name: 'Владимир Арнольд', profession: 'Математик', image: '📐' },
        { name: 'Григорий Перельман', profession: 'Математик', image: '📐' },
        { name: 'Андрей Ершов', profession: 'Программист', image: '💻' },
        { name: 'Алексей Ляпунов', profession: 'Математик', image: '💻' },
        { name: 'Сергей Лебедев', profession: 'Инженер', image: '💻' },
        { name: 'Виктор Глушков', profession: 'Информатик', image: '💻' },
        { name: 'Павел Дуров', profession: 'Предприниматель', image: '💻' },
        { name: 'Аркадий Волож', profession: 'Предприниматель', image: '💻' },
        { name: 'Евгений Касперский', profession: 'Предприниматель', image: '🛡️' },
        { name: 'Дмитрий Гришин', profession: 'Предприниматель', image: '💻' }
    ],
    ESTJ: [
        // Administrators & Leaders
        { name: 'Сергей Шойгу', profession: 'Министр обороны', image: '🛡️' },
        { name: 'Герман Греф', profession: 'Глава Сбербанка', image: '🏦' },
        { name: 'Алексей Миллер', profession: 'Глава Газпрома', image: '🏭' },
        { name: 'Сергей Собянин', profession: 'Мэр Москвы', image: '🏙️' },
        { name: 'Елена Батурина', profession: 'Предпринимательница', image: '💼' },
        { name: 'Сергей Кириенко', profession: 'Госдеятель', image: '🏛️' },
        { name: 'Игорь Сечин', profession: 'Глава Роснефти', image: '🛢️' },
        { name: 'Дмитрий Рогозин', profession: 'Руководитель Роскосмоса', image: '🚀' },
        { name: 'Эльвира Набиуллина', profession: 'Глава ЦБ', image: '💱' },
        { name: 'Антон Силуанов', profession: 'Министр финансов', image: '💼' },
        { name: 'Татьяна Голикова', profession: 'Вице-премьер', image: '🏥' },
        { name: 'Сергей Чемезов', profession: 'Глава Ростех', image: '🏭' }
    ],

    ESFJ: [
        // TV & Entertainment
        { name: 'Иван Ургант', profession: 'Телеведущий', image: '📺' },
        { name: 'Максим Галкин', profession: 'Артист', image: '🎭' },
        { name: 'Филипп Киркоров', profession: 'Певец', image: '🎤' },
        { name: 'Лариса Гузеева', profession: 'Актриса и телеведущая', image: '📺' },
        { name: 'Регина Тодоренко', profession: 'Телеведущая', image: '🎤' },
        { name: 'Дмитрий Нагиев', profession: 'Актер и телеведущий', image: '🎬' },
        { name: 'Андрей Малахов', profession: 'Телеведущий', image: '📺' },
        { name: 'Ксения Бородина', profession: 'Телеведущая', image: '🎤' },
        { name: 'Тина Канделаки', profession: 'Телеведущая', image: '🎙️' },
        { name: 'Ольга Бузова', profession: 'Телеведущая и певица', image: '🎤' },
        { name: 'Екатерина Варнава', profession: 'Артистка', image: '🎭' },
        { name: 'Агата Муцениеце', profession: 'Актриса и ведущая', image: '🎬' }
    ],

    ENFJ: [
        // Cinema & Charity
        { name: 'Константин Хабенский', profession: 'Актер, благотворитель', image: '🎬' },
        { name: 'Чулпан Хаматова', profession: 'Актриса, благотворитель', image: '🎭' },
        { name: 'Евгений Миронов', profession: 'Актер', image: '🎬' },
        { name: 'Олег Табаков', profession: 'Режиссер и актер', image: '🎭' },
        { name: 'Владимир Познер', profession: 'Журналист', image: '📰' },
        { name: 'Данила Козловский', profession: 'Актер', image: '🎬' },
        { name: 'Сергей Безруков', profession: 'Актер', image: '🎭' },
        { name: 'Александр Петров', profession: 'Актер', image: '🎬' },
        { name: 'Юлия Пересильд', profession: 'Актриса', image: '🎬' },
        { name: 'Светлана Ходченкова', profession: 'Актриса', image: '🎭' },
        { name: 'Елизавета Боярская', profession: 'Актриса', image: '🎬' },
        { name: 'Наталья Водянова', profession: 'Модель и благотворитель', image: '💖' }
    ],

    ENTJ: [
        // Business & Strategy
        { name: 'Олег Тиньков', profession: 'Предприниматель', image: '💳' },
        { name: 'Татьяна Бакальчук', profession: 'Основательница Wildberries', image: '🛍️' },
        { name: 'Игорь Ашурбейли', profession: 'Предприниматель', image: '🏗️' },
        { name: 'Анатолий Чубайс', profession: 'Менеджер и реформатор', image: '🧩' },
        { name: 'Михаил Прохоров', profession: 'Предприниматель', image: '💼' },
        { name: 'Сергей Галицкий', profession: 'Предприниматель', image: '🛒' },
        { name: 'Андрей Мельниченко', profession: 'Предприниматель', image: '⚙️' },
        { name: 'Леонид Федун', profession: 'Предприниматель', image: '🛢️' },
        { name: 'Борис Нуралиев', profession: 'Основатель 1С', image: '💾' },
        { name: 'Наталья Касперская', profession: 'Предпринимательница', image: '🛡️' },
        { name: 'Рубен Варданян', profession: 'Предприниматель', image: '💼' },
        { name: 'Игорь Рыбаков', profession: 'Предприниматель', image: '🧱' }
    ],

    ESTP: [
        // Sport & Show
        { name: 'Владимир Жириновский', profession: 'Политик и шоумен', image: '🎤' },
        { name: 'Никита Михалков', profession: 'Режиссер и общественный деятель', image: '🎬' },
        { name: 'Егор Крид', profession: 'Певец', image: '🎤' },
        { name: 'Тимати', profession: 'Рэпер и бизнесмен', image: '🎧' },
        { name: 'Моргенштерн', profession: 'Артист', image: '🎵' },
        { name: 'Александр Емельяненко', profession: 'Боец ММА', image: '🥊' },
        { name: 'Артем Дзюба', profession: 'Футболист', image: '⚽' },
        { name: 'Федор Смолов', profession: 'Футболист', image: '⚽' },
        { name: 'Александр Кокорин', profession: 'Футболист', image: '⚽' },
        { name: 'Сергей Шнуров', profession: 'Музыкант', image: '🎸' },
        { name: 'Гарик Харламов', profession: 'Комик', image: '🎤' },
        { name: 'Никита Джигурда', profession: 'Артист', image: '🎭' }
    ],

    ESFP: [
        // Pop & Stage
        { name: 'Алла Пугачева', profession: 'Певица', image: '🎤' },
        { name: 'Николай Басков', profession: 'Певец', image: '🎶' },
        { name: 'Вера Брежнева', profession: 'Певица', image: '🎤' },
        { name: 'Земфира', profession: 'Певица', image: '🎵' },
        { name: 'Полина Гагарина', profession: 'Певица', image: '🎶' },
        { name: 'Дима Билан', profession: 'Певец', image: '🎤' },
        { name: 'Сергей Лазарев', profession: 'Певец', image: '🎤' },
        { name: 'Нюша', profession: 'Певица', image: '🎶' },
        { name: 'Валерия', profession: 'Певица', image: '🎤' },
        { name: 'Ёлка', profession: 'Певица', image: '🎶' },
        { name: 'МакSим', profession: 'Певица', image: '🎤' },
        { name: 'Лолита', profession: 'Певица', image: '🎤' }
    ],

    ENFP: [
        // Creative & Media
        { name: 'Виктор Цой', profession: 'Музыкант', image: '🎸' },
        { name: 'Сергей Бодров', profession: 'Актер и режиссер', image: '🎬' },
        { name: 'Юрий Дудь', profession: 'Журналист и интервьюер', image: '🎤' },
        { name: 'Ксения Собчак', profession: 'ТВ и общественный деятель', image: '📺' },
        { name: 'Дмитрий Быков', profession: 'Писатель и публицист', image: '🖋️' },
        { name: 'Оксимирон', profession: 'Рэпер', image: '🎤' },
        { name: 'Баста', profession: 'Рэпер', image: '🎤' },
        { name: 'Noize MC', profession: 'Рэпер', image: '🎸' },
        { name: 'Илья Прусикин', profession: 'Музыкант', image: '🎵' },
        { name: 'Михаил Зыгарь', profession: 'Журналист', image: '📰' },
        { name: 'Рената Литвинова', profession: 'Режиссер и актриса', image: '🎬' },
        { name: 'Гарик Сукачев', profession: 'Музыкант', image: '🎸' }
    ],

    ENTP: [
        // Debaters & Innovators
        { name: 'Илья Варламов', profession: 'Блогер и урбанист', image: '🏙️' },
        { name: 'Александр Невзоров', profession: 'Журналист', image: '📰' },
        { name: 'Павел Воля', profession: 'Комик и шоумен', image: '🎤' },
        { name: 'Леонид Парфенов', profession: 'Журналист', image: '📺' },
        { name: 'Анатолий Вассерман', profession: 'Публицист', image: '🧠' },
        { name: 'Данила Поперечный', profession: 'Комик', image: '🎤' },
        { name: 'Гарик Мартиросян', profession: 'Комик', image: '🎭' },
        { name: 'Михаил Галустян', profession: 'Комик', image: '🎭' },
        { name: 'Дмитрий Пучков', profession: 'Публицист', image: '📝' },
        { name: 'Юрий Хованский', profession: 'Блогер', image: '🎥' },
        { name: 'Максим Кац', profession: 'Общественный деятель', image: '🏙️' },
        { name: 'Олег Кашин', profession: 'Журналист', image: '📰' }
    ]
};

export default RUSSIAN_PERSONALITIES; 