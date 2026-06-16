/** Транспортные хабы России (~200 точек для геопривязки) */
export interface TransportHub {
  id: string;
  name: string;
  lat: number;
  lon: number;
  airportCode?: string;
  hasRail: boolean;
  region?: string;
}

export const TRANSPORT_HUBS: TransportHub[] = [
  // ── Центр ──
  { id: 'moscow', name: 'Москва', lat: 55.7558, lon: 37.6173, airportCode: 'MOW', hasRail: true, region: 'central' },
  { id: 'tula', name: 'Тула', lat: 54.1931, lon: 37.6173, hasRail: true, region: 'central' },
  { id: 'ryazan', name: 'Рязань', lat: 54.6269, lon: 39.6916, hasRail: true, region: 'central' },
  { id: 'tver', name: 'Тверь', lat: 56.8587, lon: 35.9176, hasRail: true, region: 'central' },
  { id: 'yaroslavl', name: 'Ярославль', lat: 57.6261, lon: 39.8845, hasRail: true, region: 'central' },
  { id: 'vladimir', name: 'Владимир', lat: 56.129, lon: 40.407, hasRail: true, region: 'central' },
  { id: 'ivanovo', name: 'Иваново', lat: 57.0004, lon: 40.9739, hasRail: true, region: 'central' },
  { id: 'kostroma', name: 'Кострома', lat: 57.7665, lon: 40.9269, hasRail: true, region: 'central' },
  { id: 'smolensk', name: 'Смоленск', lat: 54.7826, lon: 32.0453, hasRail: true, region: 'central' },
  { id: 'kaluga', name: 'Калуга', lat: 54.5293, lon: 36.2754, hasRail: true, region: 'central' },
  { id: 'bryansk', name: 'Брянск', lat: 53.2434, lon: 34.3654, airportCode: 'BZK', hasRail: true, region: 'central' },
  { id: 'orel', name: 'Орёл', lat: 52.9703, lon: 36.0635, hasRail: true, region: 'central' },
  { id: 'kursk', name: 'Курск', lat: 51.7373, lon: 36.1873, hasRail: true, region: 'central' },
  { id: 'belgorod', name: 'Белгород', lat: 50.5951, lon: 36.5872, airportCode: 'EGO', hasRail: true, region: 'central' },
  { id: 'lipetsk', name: 'Липецк', lat: 52.6031, lon: 39.5708, hasRail: true, region: 'central' },
  { id: 'tambov', name: 'Тамбов', lat: 52.7213, lon: 41.4523, airportCode: 'TBW', hasRail: true, region: 'central' },
  { id: 'voronezh', name: 'Воронеж', lat: 51.672, lon: 39.1843, airportCode: 'VOZ', hasRail: true, region: 'central' },
  { id: 'kaluga_obninsk', name: 'Обнинск', lat: 55.0968, lon: 36.6101, hasRail: true, region: 'central' },
  { id: 'podolsk', name: 'Подольск', lat: 55.4242, lon: 37.5547, hasRail: true, region: 'central' },
  { id: 'kolomna', name: 'Коломна', lat: 55.0794, lon: 38.7783, hasRail: true, region: 'central' },
  { id: 'serpukhov', name: 'Серпухов', lat: 54.9227, lon: 37.4037, hasRail: true, region: 'central' },
  { id: 'murom', name: 'Муром', lat: 55.563, lon: 42.023, hasRail: true, region: 'central' },
  { id: 'kovrov', name: 'Ковров', lat: 56.3557, lon: 41.317, hasRail: true, region: 'central' },
  { id: 'dzerzhinsk', name: 'Дзержинск', lat: 56.2376, lon: 43.4599, hasRail: true, region: 'central' },
  { id: 'elektrostal', name: 'Электросталь', lat: 55.784, lon: 38.444, hasRail: true, region: 'central' },

  // ── Северо-Запад ──
  { id: 'spb', name: 'Санкт-Петербург', lat: 59.9343, lon: 30.3351, airportCode: 'LED', hasRail: true, region: 'northwest' },
  { id: 'kaliningrad', name: 'Калининград', lat: 54.7104, lon: 20.4522, airportCode: 'KGD', hasRail: true, region: 'northwest' },
  { id: 'murmansk', name: 'Мурманск', lat: 68.9585, lon: 33.0827, airportCode: 'MMK', hasRail: true, region: 'northwest' },
  { id: 'arkhangelsk', name: 'Архангельск', lat: 64.5401, lon: 40.5433, airportCode: 'ARH', hasRail: true, region: 'northwest' },
  { id: 'vologda', name: 'Вологда', lat: 59.2205, lon: 39.8915, hasRail: true, region: 'northwest' },
  { id: 'cherepovets', name: 'Череповец', lat: 59.1265, lon: 37.9092, hasRail: true, region: 'northwest' },
  { id: 'petrozavodsk', name: 'Петрозаводск', lat: 61.785, lon: 34.3469, hasRail: true, region: 'northwest' },
  { id: 'syktyvkar', name: 'Сыктывкар', lat: 61.668, lon: 50.835, airportCode: 'SCW', hasRail: true, region: 'northwest' },
  { id: 'pskov', name: 'Псков', lat: 57.8194, lon: 28.3318, hasRail: true, region: 'northwest' },
  { id: 'veliky_novgorod', name: 'Великий Новгород', lat: 58.5228, lon: 31.2698, hasRail: true, region: 'northwest' },
  { id: 'velikiye_luki', name: 'Великие Луки', lat: 56.3404, lon: 30.5454, hasRail: true, region: 'northwest' },
  { id: 'severodvinsk', name: 'Северодвинск', lat: 64.5622, lon: 39.8182, hasRail: true, region: 'northwest' },
  { id: 'sortavala', name: 'Сортавала', lat: 61.7033, lon: 30.6917, hasRail: true, region: 'northwest' },
  { id: 'gatchina', name: 'Гатчина', lat: 59.5764, lon: 30.1283, hasRail: true, region: 'northwest' },
  { id: 'vorkuta', name: 'Воркута', lat: 67.4979, lon: 64.0525, airportCode: 'VKT', hasRail: true, region: 'northwest' },
  { id: 'naryan_mar', name: 'Нарьян-Мар', lat: 67.638, lon: 53.0069, airportCode: 'NNM', hasRail: true, region: 'northwest' },
  { id: 'apatity', name: 'Апатиты', lat: 67.5676, lon: 33.3971, hasRail: true, region: 'northwest' },

  // ── Поволжье ──
  { id: 'kazan', name: 'Казань', lat: 55.8304, lon: 49.0661, airportCode: 'KZN', hasRail: true, region: 'volga' },
  { id: 'nn', name: 'Нижний Новгород', lat: 56.2965, lon: 43.9361, airportCode: 'GOJ', hasRail: true, region: 'volga' },
  { id: 'samara', name: 'Самара', lat: 53.1959, lon: 50.1002, airportCode: 'KUF', hasRail: true, region: 'volga' },
  { id: 'saratov', name: 'Саратов', lat: 51.5336, lon: 46.0343, airportCode: 'RTW', hasRail: true, region: 'volga' },
  { id: 'penza', name: 'Пенза', lat: 53.195, lon: 45.018, hasRail: true, region: 'volga' },
  { id: 'ulyanovsk', name: 'Ульяновск', lat: 54.3142, lon: 48.4031, airportCode: 'ULV', hasRail: true, region: 'volga' },
  { id: 'tolyatti', name: 'Тольятти', lat: 53.5078, lon: 49.4204, hasRail: true, region: 'volga' },
  { id: 'izhevsk', name: 'Ижевск', lat: 56.8527, lon: 53.2115, airportCode: 'IJK', hasRail: true, region: 'volga' },
  { id: 'kirov', name: 'Киров', lat: 58.6035, lon: 49.668, airportCode: 'KVX', hasRail: true, region: 'volga' },
  { id: 'cheboksary', name: 'Чебоксары', lat: 56.1322, lon: 47.2519, hasRail: true, region: 'volga' },
  { id: 'yoshkar_ola', name: 'Йошкар-Ола', lat: 56.6344, lon: 47.8999, hasRail: true, region: 'volga' },
  { id: 'saransk', name: 'Саранск', lat: 54.1874, lon: 45.1839, airportCode: 'SKX', hasRail: true, region: 'volga' },
  { id: 'naberezhnye_chelny', name: 'Набережные Челны', lat: 55.7436, lon: 52.3958, hasRail: true, region: 'volga' },
  { id: 'nizhnekamsk', name: 'Нижнекамск', lat: 55.6313, lon: 51.8141, hasRail: true, region: 'volga' },
  { id: 'dimitrovgrad', name: 'Димитровград', lat: 54.2169, lon: 49.6234, hasRail: true, region: 'volga' },
  { id: 'engels', name: 'Энгельс', lat: 51.4839, lon: 46.1052, hasRail: true, region: 'volga' },
  { id: 'balakovo', name: 'Балаково', lat: 52.0226, lon: 47.7828, hasRail: true, region: 'volga' },
  { id: 'syzran', name: 'Сызрань', lat: 53.1557, lon: 48.4745, hasRail: true, region: 'volga' },
  { id: 'volzhsky', name: 'Волжский', lat: 48.7979, lon: 44.7461, hasRail: true, region: 'volga' },
  { id: 'elista', name: 'Элиста', lat: 46.3078, lon: 44.2558, airportCode: 'ESL', hasRail: true, region: 'volga' },
  { id: 'orenburg', name: 'Оренбург', lat: 51.768, lon: 55.098, airportCode: 'REN', hasRail: true, region: 'volga' },
  { id: 'orsk', name: 'Орск', lat: 51.2049, lon: 58.5668, airportCode: 'OSW', hasRail: true, region: 'volga' },
  { id: 'almetevsk', name: 'Альметьевск', lat: 54.9014, lon: 52.2973, hasRail: true, region: 'volga' },
  { id: 'nizhnevartovsk', name: 'Нижневартовск', lat: 60.9397, lon: 76.5696, airportCode: 'NJC', hasRail: true, region: 'volga' },

  // ── Юг ──
  { id: 'rostov', name: 'Ростов-на-Дону', lat: 47.2357, lon: 39.7015, airportCode: 'ROV', hasRail: true, region: 'south' },
  { id: 'krasnodar', name: 'Краснодар', lat: 45.0355, lon: 38.9753, airportCode: 'KRR', hasRail: true, region: 'south' },
  { id: 'stavropol', name: 'Ставрополь', lat: 45.0428, lon: 41.9734, airportCode: 'STW', hasRail: true, region: 'south' },
  { id: 'minvody', name: 'Минеральные Воды', lat: 44.2103, lon: 43.1353, airportCode: 'MRV', hasRail: true, region: 'south' },
  { id: 'sochi', name: 'Сочи', lat: 43.6028, lon: 39.7342, airportCode: 'AER', hasRail: true, region: 'south' },
  { id: 'volgograd', name: 'Волгоград', lat: 48.708, lon: 44.5133, airportCode: 'VOG', hasRail: true, region: 'south' },
  { id: 'astrakhan', name: 'Астрахань', lat: 46.3497, lon: 48.0408, airportCode: 'ASF', hasRail: true, region: 'south' },
  { id: 'makhachkala', name: 'Махачкала', lat: 42.9849, lon: 47.5047, airportCode: 'MCX', hasRail: true, region: 'south' },
  { id: 'nalchik', name: 'Нальчик', lat: 43.4853, lon: 43.6071, airportCode: 'NAL', hasRail: true, region: 'south' },
  { id: 'simferopol', name: 'Симферополь', lat: 44.9521, lon: 34.1024, airportCode: 'SIP', hasRail: true, region: 'south' },
  { id: 'anapa', name: 'Анапа', lat: 44.8947, lon: 37.3162, airportCode: 'AAQ', hasRail: true, region: 'south' },
  { id: 'gelendzhik', name: 'Геленджик', lat: 44.563, lon: 38.079, airportCode: 'GDZ', hasRail: true, region: 'south' },
  { id: 'novorossiysk', name: 'Новороссийск', lat: 44.7235, lon: 37.7686, hasRail: true, region: 'south' },
  { id: 'taganrog', name: 'Таганрог', lat: 47.2362, lon: 38.8969, hasRail: true, region: 'south' },
  { id: 'shakhty', name: 'Шахты', lat: 47.7091, lon: 40.2144, hasRail: true, region: 'south' },
  { id: 'volgodonsk', name: 'Волгодонск', lat: 47.5165, lon: 42.1984, hasRail: true, region: 'south' },
  { id: 'armavir', name: 'Армавир', lat: 45.0013, lon: 41.1234, hasRail: true, region: 'south' },
  { id: 'maykop', name: 'Майкоп', lat: 44.6078, lon: 40.1058, hasRail: true, region: 'south' },
  { id: 'pyatigorsk', name: 'Пятигорск', lat: 44.0486, lon: 43.0594, hasRail: true, region: 'south' },
  { id: 'kislovodsk', name: 'Кисловодск', lat: 43.9053, lon: 42.7168, hasRail: true, region: 'south' },
  { id: 'essentuki', name: 'Ессентуки', lat: 44.0444, lon: 42.8649, hasRail: true, region: 'south' },
  { id: 'nevinomyssk', name: 'Невинномысск', lat: 44.6333, lon: 41.936, hasRail: true, region: 'south' },
  { id: 'cherkessk', name: 'Черкесск', lat: 44.2269, lon: 42.0468, hasRail: true, region: 'south' },
  { id: 'grozny', name: 'Грозный', lat: 43.318, lon: 45.6982, airportCode: 'GRV', hasRail: true, region: 'south' },
  { id: 'vladikavkaz', name: 'Владикавказ', lat: 43.0246, lon: 44.6816, airportCode: 'OGZ', hasRail: true, region: 'south' },
  { id: 'derbent', name: 'Дербент', lat: 42.0578, lon: 48.2906, hasRail: true, region: 'south' },
  { id: 'kaspiysk', name: 'Каспийск', lat: 42.8816, lon: 47.6382, hasRail: true, region: 'south' },
  { id: 'tuapse', name: 'Туапсе', lat: 44.095, lon: 39.0734, hasRail: true, region: 'south' },
  { id: 'labinsk', name: 'Лабинск', lat: 44.634, lon: 40.7245, hasRail: true, region: 'south' },
  { id: 'tikhoretsk', name: 'Тихорецк', lat: 45.8547, lon: 40.1258, hasRail: true, region: 'south' },
  { id: 'bataysk', name: 'Батайск', lat: 47.1383, lon: 39.7445, hasRail: true, region: 'south' },
  { id: 'novocherkassk', name: 'Новочеркасск', lat: 47.4119, lon: 40.1036, hasRail: true, region: 'south' },
  { id: 'sal', name: 'Сальск', lat: 46.4757, lon: 41.541, hasRail: true, region: 'south' },
  { id: 'tselina', name: 'пос. Целина', lat: 46.316, lon: 41.033, hasRail: true, region: 'south' },

  // ── Урал ──
  { id: 'ekb', name: 'Екатеринбург', lat: 56.8389, lon: 60.6057, airportCode: 'SVX', hasRail: true, region: 'ural' },
  { id: 'chelyabinsk', name: 'Челябинск', lat: 55.1644, lon: 61.4368, airportCode: 'CEK', hasRail: true, region: 'ural' },
  { id: 'tyumen', name: 'Тюмень', lat: 57.1522, lon: 65.5272, airportCode: 'TJM', hasRail: true, region: 'ural' },
  { id: 'ufa', name: 'Уфа', lat: 54.7388, lon: 55.9721, airportCode: 'UFA', hasRail: true, region: 'ural' },
  { id: 'perm', name: 'Пермь', lat: 58.0105, lon: 56.2502, airportCode: 'PEE', hasRail: true, region: 'ural' },
  { id: 'magnitogorsk', name: 'Магнитогорск', lat: 53.4078, lon: 58.9792, airportCode: 'MQF', hasRail: true, region: 'ural' },
  { id: 'nizhny_tagil', name: 'Нижний Тагил', lat: 57.9101, lon: 59.9813, hasRail: true, region: 'ural' },
  { id: 'kurgan', name: 'Курган', lat: 55.4444, lon: 65.3161, airportCode: 'KRO', hasRail: true, region: 'ural' },
  { id: 'surgut', name: 'Сургут', lat: 61.254, lon: 73.3962, airportCode: 'SGC', hasRail: true, region: 'ural' },
  { id: 'nefteyugansk', name: 'Нефтеюганск', lat: 61.088, lon: 72.616, airportCode: 'NFG', hasRail: true, region: 'ural' },
  { id: 'noyabrsk', name: 'Ноябрьск', lat: 63.2018, lon: 75.451, airportCode: 'NOJ', hasRail: true, region: 'ural' },
  { id: 'novy_urengoy', name: 'Новый Уренгой', lat: 66.084, lon: 76.681, airportCode: 'NUX', hasRail: true, region: 'ural' },
  { id: 'salekhard', name: 'Салехард', lat: 66.5494, lon: 66.5915, airportCode: 'SLY', hasRail: true, region: 'ural' },
  { id: 'sterlitamak', name: 'Стерлитамак', lat: 53.6246, lon: 55.9501, hasRail: true, region: 'ural' },
  { id: 'salavat', name: 'Салават', lat: 53.3616, lon: 55.9246, hasRail: true, region: 'ural' },
  { id: 'neftekamsk', name: 'Нефтекамск', lat: 56.088, lon: 54.248, hasRail: true, region: 'ural' },
  { id: 'miass', name: 'Миасс', lat: 55.045, lon: 60.1083, hasRail: true, region: 'ural' },
  { id: 'zlatoust', name: 'Златоуст', lat: 55.1711, lon: 59.6506, hasRail: true, region: 'ural' },
  { id: 'kamensk_ural', name: 'Каменск-Уральский', lat: 56.4149, lon: 61.9189, hasRail: true, region: 'ural' },
  { id: 'pervouralsk', name: 'Первоуральск', lat: 56.905, lon: 59.943, hasRail: true, region: 'ural' },
  { id: 'serov', name: 'Серов', lat: 59.6033, lon: 60.5747, hasRail: true, region: 'ural' },
  { id: 'solikamsk', name: '\u0421\u043e\u043b\u0438\u043a\u0430\u043c\u0441\u043a', lat: 59.6316, lon: 56.7715, hasRail: true, region: 'ural' },
  { id: 'berezniki', name: '\u0411\u0435\u0440\u0435\u0437\u043d\u0438\u043a\u0438', lat: 59.408, lon: 56.805, hasRail: true, region: 'ural' },
  { id: 'nyagan', name: '\u041d\u044f\u0433\u0430\u043d\u044c', lat: 62.145, lon: 65.394, airportCode: 'NYA', hasRail: true, region: 'ural' },
  { id: 'kogalym', name: '\u041a\u043e\u0433\u0430\u043b\u044b\u043c', lat: 62.265, lon: 74.479, airportCode: 'KGP', hasRail: true, region: 'ural' },
  { id: 'khanty_mansiysk', name: '\u0425\u0430\u043d\u0442\u044b-\u041c\u0430\u043d\u0441\u0438\u0439\u0441\u043a', lat: 61.0042, lon: 69.0019, airportCode: 'HMA', hasRail: true, region: 'ural' },

  // ── Сибирь ──
  { id: 'novosibirsk', name: '\u041d\u043e\u0432\u043e\u0441\u0438\u0431\u0438\u0440\u0441\u043a', lat: 55.0084, lon: 82.9357, airportCode: 'OVB', hasRail: true, region: 'siberia' },
  { id: 'omsk', name: '\u041e\u043c\u0441\u043a', lat: 54.9885, lon: 73.3242, airportCode: 'OMS', hasRail: true, region: 'siberia' },
  { id: 'krasnoyarsk', name: '\u041a\u0440\u0430\u0441\u043d\u043e\u044f\u0440\u0441\u043a', lat: 56.0153, lon: 92.8932, airportCode: 'KJA', hasRail: true, region: 'siberia' },
  { id: 'irkutsk', name: '\u0418\u0440\u043a\u0443\u0442\u0441\u043a', lat: 52.287, lon: 104.305, airportCode: 'IKT', hasRail: true, region: 'siberia' },
  { id: 'barnaul', name: '\u0411\u0430\u0440\u043d\u0430\u0443\u043b', lat: 53.348, lon: 83.779, airportCode: 'BAX', hasRail: true, region: 'siberia' },
  { id: 'tomsk', name: '\u0422\u043e\u043c\u0441\u043a', lat: 56.4977, lon: 84.9744, airportCode: 'TOF', hasRail: true, region: 'siberia' },
  { id: 'kemerovo', name: '\u041a\u0435\u043c\u0435\u0440\u043e\u0432\u043e', lat: 55.3331, lon: 86.0837, airportCode: 'KEJ', hasRail: true, region: 'siberia' },
  { id: 'novokuznetsk', name: '\u041d\u043e\u0432\u043e\u043a\u0443\u0437\u043d\u0435\u0446\u043a', lat: 53.7576, lon: 87.136, airportCode: 'NOZ', hasRail: true, region: 'siberia' },
  { id: 'abakan', name: '\u0410\u0431\u0430\u043a\u0430\u043d', lat: 53.7212, lon: 91.4424, airportCode: 'ABA', hasRail: true, region: 'siberia' },
  { id: 'chita', name: '\u0427\u0438\u0442\u0430', lat: 52.0339, lon: 113.4994, airportCode: 'HTA', hasRail: true, region: 'siberia' },
  { id: 'ulan_ude', name: '\u0423\u043b\u0430\u043d-\u0423\u0434\u044d', lat: 51.8345, lon: 107.5847, airportCode: 'UUD', hasRail: true, region: 'siberia' },
  { id: 'bratsk', name: '\u0411\u0440\u0430\u0442\u0441\u043a', lat: 56.1514, lon: 101.634, airportCode: 'BTK', hasRail: true, region: 'siberia' },
  { id: 'angarsk', name: '\u0410\u043d\u0433\u0430\u0440\u0441\u043a', lat: 52.5448, lon: 103.8884, hasRail: true, region: 'siberia' },
  { id: 'biysk', name: '\u0411\u0438\u0439\u0441\u043a', lat: 52.541, lon: 85.22, hasRail: true, region: 'siberia' },
  { id: 'rubtsovsk', name: '\u0420\u0443\u0431\u0446\u043e\u0432\u0441\u043a', lat: 51.5263, lon: 81.2067, hasRail: true, region: 'siberia' },
  { id: 'prokopyevsk', name: '\u041f\u0440\u043e\u043a\u043e\u043f\u044c\u0435\u0432\u0441\u043a', lat: 53.906, lon: 86.719, hasRail: true, region: 'siberia' },
  { id: 'leninsk_kuznetsky', name: '\u041b\u0435\u043d\u0438\u043d\u0441\u043a-\u041a\u0443\u0437\u043d\u0435\u0446\u043a\u0438\u0439', lat: 54.656, lon: 86.1737, hasRail: true, region: 'siberia' },
  { id: 'norilsk', name: '\u041d\u043e\u0440\u0438\u043b\u044c\u0441\u043a', lat: 69.3535, lon: 88.2027, airportCode: 'NSK', hasRail: true, region: 'siberia' },
  { id: 'kyzyl', name: '\u041a\u044b\u0437\u044b\u043b', lat: 51.7191, lon: 94.4377, airportCode: 'KYZ', hasRail: true, region: 'siberia' },
  { id: 'gorno_altaysk', name: '\u0413\u043e\u0440\u043d\u043e-\u0410\u043b\u0442\u0430\u0439\u0441\u043a', lat: 51.958, lon: 85.9603, airportCode: 'RGK', hasRail: true, region: 'siberia' },
  { id: 'seversk', name: '\u0421\u0435\u0432\u0435\u0440\u0441\u043a', lat: 56.603, lon: 84.8809, hasRail: true, region: 'siberia' },
  { id: 'berdsk', name: '\u0411\u0435\u0440\u0434\u0441\u043a', lat: 54.758, lon: 83.107, hasRail: true, region: 'siberia' },
  { id: 'iskitim', name: '\u0418\u0441\u043a\u0438\u0442\u0438\u043c', lat: 54.642, lon: 83.304, hasRail: true, region: 'siberia' },
  { id: 'achinsk', name: '\u0410\u0447\u0438\u043d\u0441\u043a', lat: 56.269, lon: 90.499, hasRail: true, region: 'siberia' },
  { id: 'minussinsk', name: '\u041c\u0438\u043d\u0443\u0441\u0438\u043d\u0441\u043a', lat: 53.710, lon: 91.687, hasRail: true, region: 'siberia' },
  { id: 'tobolsk', name: '\u0422\u043e\u0431\u043e\u043b\u044c\u0441\u043a', lat: 58.198, lon: 68.254, hasRail: true, region: 'siberia' },
  { id: 'kansk', name: '\u041a\u0430\u043d\u0441\u043a', lat: 56.205, lon: 95.705, hasRail: true, region: 'siberia' },

  // ── Дальний Восток ──
  { id: 'vladivostok', name: '\u0412\u043b\u0430\u0434\u0438\u0432\u043e\u0441\u0442\u043e\u043a', lat: 43.1155, lon: 131.8855, airportCode: 'VVO', hasRail: true, region: 'far_east' },
  { id: 'khabarovsk', name: '\u0425\u0430\u0431\u0430\u0440\u043e\u0432\u0441\u043a', lat: 48.4827, lon: 135.0838, airportCode: 'KHV', hasRail: true, region: 'far_east' },
  { id: 'yuzhno_sakhalinsk', name: '\u042e\u0436\u043d\u043e-\u0421\u0430\u0445\u0430\u043b\u0438\u043d\u0441\u043a', lat: 46.9591, lon: 142.738, airportCode: 'UUS', hasRail: true, region: 'far_east' },
  { id: 'petropavlovsk_kamchatsky', name: '\u041f\u0435\u0442\u0440\u043e\u043f\u0430\u0432\u043b\u043e\u0432\u0441\u043a-\u041a\u0430\u043c\u0447\u0430\u0442\u0441\u043a\u0438\u0439', lat: 53.024, lon: 158.643, airportCode: 'PKC', hasRail: true, region: 'far_east' },
  { id: 'yakutsk', name: '\u042f\u043a\u0443\u0442\u0441\u043a', lat: 62.0355, lon: 129.6755, airportCode: 'YKS', hasRail: true, region: 'far_east' },
  { id: 'blagoveshchensk', name: '\u0411\u043b\u0430\u0433\u043e\u0432\u0435\u0449\u0435\u043d\u0441\u043a', lat: 50.2907, lon: 127.5272, airportCode: 'BQS', hasRail: true, region: 'far_east' },
  { id: 'komsomolsk_amur', name: '\u041a\u043e\u043c\u0441\u043e\u043c\u043e\u043b\u044c\u0441\u043a-\u043d\u0430-\u0410\u043c\u0443\u0440\u0435', lat: 50.55, lon: 137.007, airportCode: 'KXK', hasRail: true, region: 'far_east' },
  { id: 'ussuriysk', name: '\u0423\u0441\u0441\u0443\u0440\u0438\u0439\u0441\u043a', lat: 43.797, lon: 131.951, hasRail: true, region: 'far_east' },
  { id: 'nakhodka', name: '\u041d\u0430\u0445\u043e\u0434\u043a\u0430', lat: 42.824, lon: 132.892, hasRail: true, region: 'far_east' },
  { id: 'artem', name: '\u0410\u0440\u0442\u0451\u043c', lat: 43.359, lon: 132.189, airportCode: 'VVO', hasRail: true, region: 'far_east' },
  { id: 'magadan', name: '\u041c\u0430\u0433\u0430\u0434\u0430\u043d', lat: 59.568, lon: 150.808, airportCode: 'GDX', hasRail: true, region: 'far_east' },
  { id: 'anadyr', name: '\u0410\u043d\u0430\u0434\u044b\u0440\u044c', lat: 64.735, lon: 177.509, airportCode: 'DYR', hasRail: true, region: 'far_east' },
  { id: 'mirny', name: '\u041c\u0438\u0440\u043d\u044b\u0439', lat: 62.535, lon: 114.030, airportCode: 'MJZ', hasRail: true, region: 'far_east' },
  { id: 'neryungri', name: '\u041d\u0435\u0440\u044e\u043d\u0433\u0440\u0438', lat: 56.660, lon: 124.712, airportCode: 'NER', hasRail: true, region: 'far_east' },
  { id: 'svobodny', name: '\u0421\u0432\u043e\u0431\u043e\u0434\u043d\u044b\u0439', lat: 51.375, lon: 128.134, hasRail: true, region: 'far_east' },
  { id: 'belogorsk', name: '\u0411\u0435\u043b\u043e\u0433\u043e\u0440\u0441\u043a', lat: 50.916, lon: 128.463, hasRail: true, region: 'far_east' },
  { id: 'yuzhno_kurilsk', name: '\u042e\u0436\u043d\u043e-\u041a\u0443\u0440\u0438\u043b\u044c\u0441\u043a', lat: 44.027, lon: 145.861, hasRail: false, region: 'far_east' },

  // ── Дополнительные ж/д узлы и города ──
  { id: 'stary_oskol', name: '\u0421\u0442\u0430\u0440\u044b\u0439 \u041e\u0441\u043a\u043e\u043b', lat: 51.296, lon: 37.841, hasRail: true, region: 'central' },
  { id: 'gryazi', name: '\u0413\u0440\u044f\u0437\u0438', lat: 52.487, lon: 39.933, hasRail: true, region: 'central' },
  { id: 'kineshma', name: '\u041a\u0438\u043d\u0435\u0448\u043c\u0430', lat: 57.439, lon: 42.128, hasRail: true, region: 'volga' },
  { id: 'rybinsk', name: '\u0420\u044b\u0431\u0438\u043d\u0441\u043a', lat: 58.044, lon: 38.842, hasRail: true, region: 'central' },
  { id: 'shuya', name: '\u0428\u0443\u044f', lat: 56.856, lon: 41.364, hasRail: true, region: 'central' },
  { id: 'vyazma', name: '\u0412\u044f\u0437\u043c\u0430', lat: 55.210, lon: 34.295, hasRail: true, region: 'central' },
  { id: 'roslavl', name: '\u0420\u043e\u0441\u043b\u0430\u0432\u043b\u044c', lat: 53.952, lon: 32.863, hasRail: true, region: 'central' },
  { id: 'zheleznovodsk', name: '\u0416\u0435\u043b\u0435\u0437\u043d\u043e\u0432\u043e\u0434\u0441\u043a', lat: 44.139, lon: 43.020, hasRail: true, region: 'south' },
  { id: 'yeysk', name: '\u0415\u0439\u0441\u043a', lat: 46.711, lon: 38.272, airportCode: 'EIK', hasRail: true, region: 'south' },
  { id: 'kamyshin', name: '\u041a\u0430\u043c\u044b\u0448\u0438\u043d', lat: 50.098, lon: 45.416, hasRail: true, region: 'volga' },
  { id: 'bor', name: '\u0411\u043e\u0440', lat: 56.360, lon: 44.064, hasRail: true, region: 'volga' },
  { id: 'arzamas', name: '\u0410\u0440\u0437\u0430\u043c\u0430\u0441', lat: 55.394, lon: 43.840, hasRail: true, region: 'volga' },
  { id: 'balashov', name: '\u0411\u0430\u043b\u0430\u0448\u043e\u0432', lat: 51.554, lon: 43.166, hasRail: true, region: 'volga' },
  { id: 'bugulma', name: '\u0411\u0443\u0433\u0443\u043b\u044c\u043c\u0430', lat: 54.536, lon: 52.789, airportCode: 'UUA', hasRail: true, region: 'volga' },
  { id: 'oktyabrsky', name: '\u041e\u043a\u0442\u044f\u0431\u0440\u044c\u0441\u043a\u0438\u0439', lat: 54.481, lon: 53.471, hasRail: true, region: 'ural' },
  { id: 'ishim', name: '\u0418\u0448\u0438\u043c', lat: 56.109, lon: 69.479, hasRail: true, region: 'siberia' },
  { id: 'yurga', name: '\u042e\u0440\u0433\u0430', lat: 55.723, lon: 84.886, hasRail: true, region: 'siberia' },
  { id: 'mezhdurechensk', name: '\u041c\u0435\u0436\u0434\u0443\u0440\u0435\u0447\u0435\u043d\u0441\u043a', lat: 53.686, lon: 88.070, hasRail: true, region: 'siberia' },
  { id: 'zima', name: '\u0417\u0438\u043c\u0430', lat: 53.920, lon: 102.049, hasRail: true, region: 'siberia' },
  { id: 'cheremkhovo', name: '\u0427\u0435\u0440\u0435\u043c\u0445\u043e\u0432\u043e', lat: 53.156, lon: 103.067, hasRail: true, region: 'siberia' },
  { id: 'shelekhov', name: '\u0428\u0435\u043b\u0435\u0445\u043e\u0432', lat: 52.210, lon: 104.100, hasRail: true, region: 'siberia' },
  { id: 'ust_ilimsk', name: '\u0423\u0441\u0442\u044c-\u0418\u043b\u0438\u043c\u0441\u043a', lat: 57.943, lon: 102.741, hasRail: true, region: 'siberia' },
  { id: 'ust_kut', name: '\u0423\u0441\u0442\u044c-\u041a\u0443\u0442', lat: 56.793, lon: 105.767, hasRail: true, region: 'siberia' },
  { id: 'tynda', name: '\u0422\u044b\u043d\u0434\u0430', lat: 55.156, lon: 124.724, hasRail: true, region: 'far_east' },
  { id: 'skovorodino', name: '\u0421\u043a\u043e\u0432\u043e\u0440\u043e\u0434\u0438\u043d\u043e', lat: 53.987, lon: 123.943, hasRail: true, region: 'far_east' },
  { id: 'vanino', name: '\u0412\u0430\u043d\u0438\u043d\u043e', lat: 49.086, lon: 140.254, hasRail: true, region: 'far_east' },
  { id: 'sovetskaya_gavan', name: '\u0421\u043e\u0432\u0435\u0442\u0441\u043a\u0430\u044f \u0413\u0430\u0432\u0430\u043d\u044c', lat: 48.972, lon: 140.289, hasRail: true, region: 'far_east' },
  { id: 'birobidzhan', name: '\u0411\u0438\u0440\u043e\u0431\u0438\u0434\u0436\u0430\u043d', lat: 48.794, lon: 132.921, hasRail: true, region: 'far_east' },
  { id: 'shimanovsk', name: '\u0428\u0438\u043c\u0430\u043d\u043e\u0432\u0441\u043a', lat: 52.005, lon: 127.676, hasRail: true, region: 'far_east' },
  { id: 'zeya', name: '\u0417\u0435\u044f', lat: 53.734, lon: 127.265, hasRail: true, region: 'far_east' },
];

// Убрать дубликаты по id (на случай опечаток при расширении)
const _unique = new Map<string, TransportHub>();
for (const hub of TRANSPORT_HUBS) {
  if (!_unique.has(hub.id)) _unique.set(hub.id, hub);
}
export const TRANSPORT_HUBS_UNIQUE: TransportHub[] = [..._unique.values()];

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestHubs(
  lat: number,
  lon: number,
  limit = 3,
): Array<TransportHub & { distanceKm: number }> {
  return TRANSPORT_HUBS_UNIQUE.map((hub) => ({
    ...hub,
    distanceKm: Math.round(haversineKm(lat, lon, hub.lat, hub.lon)),
  }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

export function getHubById(id: string): TransportHub | undefined {
  return TRANSPORT_HUBS_UNIQUE.find((h) => h.id === id);
}

export function getHubCount(): number {
  return TRANSPORT_HUBS_UNIQUE.length;
}
