/**
 * Location Database Implementation
 *
 * Contains comprehensive database of world locations with multiple aliases.
 */

#include "location_database.h"
#include <cctype>
#include <cstring>

namespace cesium {
namespace mcp {

// Location database - comprehensive list of world locations
// Format: {name, longitude, latitude}
static const Location LOCATIONS[] = {
    // =========================================================================
    // Major World Cities
    // =========================================================================

    // United States
    {"new york", -74.006, 40.7128},
    {"new york city", -74.006, 40.7128},
    {"nyc", -74.006, 40.7128},
    {"the big apple", -74.006, 40.7128},
    {"manhattan", -73.9712, 40.7831},

    {"los angeles", -118.2437, 34.0522},
    {"la", -118.2437, 34.0522},
    {"city of angels", -118.2437, 34.0522},
    {"hollywood", -118.3287, 34.0928},

    {"chicago", -87.6298, 41.8781},
    {"chi-town", -87.6298, 41.8781},
    {"the windy city", -87.6298, 41.8781},
    {"chitown", -87.6298, 41.8781},

    {"houston", -95.3698, 29.7604},
    {"h-town", -95.3698, 29.7604},
    {"space city", -95.3698, 29.7604},

    {"phoenix", -112.074, 33.4484},
    {"phx", -112.074, 33.4484},

    {"philadelphia", -75.1652, 39.9526},
    {"philly", -75.1652, 39.9526},
    {"the city of brotherly love", -75.1652, 39.9526},

    {"san antonio", -98.4936, 29.4241},
    {"san diego", -117.1611, 32.7157},

    {"dallas", -96.797, 32.7767},
    {"big d", -96.797, 32.7767},
    {"fort worth", -97.3308, 32.7555},
    {"dfw", -97.0403, 32.8998},

    {"san jose", -121.8863, 37.3382},
    {"silicon valley", -122.0322, 37.3688},

    {"austin", -97.7431, 30.2672},
    {"atx", -97.7431, 30.2672},

    {"jacksonville", -81.6557, 30.3322},
    {"san francisco", -122.4194, 37.7749},
    {"sf", -122.4194, 37.7749},
    {"frisco", -122.4194, 37.7749},
    {"the bay", -122.4194, 37.7749},

    {"seattle", -122.3321, 47.6062},
    {"emerald city", -122.3321, 47.6062},
    {"jet city", -122.3321, 47.6062},

    {"denver", -104.9903, 39.7392},
    {"mile high city", -104.9903, 39.7392},

    {"boston", -71.0589, 42.3601},
    {"beantown", -71.0589, 42.3601},
    {"the hub", -71.0589, 42.3601},

    {"washington dc", -77.0369, 38.9072},
    {"washington d.c.", -77.0369, 38.9072},
    {"washington", -77.0369, 38.9072},
    {"dc", -77.0369, 38.9072},
    {"d.c.", -77.0369, 38.9072},
    {"the district", -77.0369, 38.9072},

    {"las vegas", -115.1398, 36.1699},
    {"vegas", -115.1398, 36.1699},
    {"sin city", -115.1398, 36.1699},

    {"miami", -80.1918, 25.7617},
    {"magic city", -80.1918, 25.7617},

    {"atlanta", -84.388, 33.749},
    {"atl", -84.388, 33.749},
    {"hotlanta", -84.388, 33.749},
    {"the a", -84.388, 33.749},

    {"detroit", -83.0458, 42.3314},
    {"motown", -83.0458, 42.3314},
    {"the d", -83.0458, 42.3314},
    {"motor city", -83.0458, 42.3314},

    {"minneapolis", -93.265, 44.9778},
    {"portland", -122.6765, 45.5152},
    {"pdx", -122.6765, 45.5152},
    {"rip city", -122.6765, 45.5152},

    {"new orleans", -90.0715, 29.9511},
    {"nola", -90.0715, 29.9511},
    {"the big easy", -90.0715, 29.9511},

    {"pittsburgh", -79.9959, 40.4406},
    {"steel city", -79.9959, 40.4406},

    {"baltimore", -76.6122, 39.2904},
    {"charm city", -76.6122, 39.2904},

    {"cleveland", -81.6944, 41.4993},
    {"nashville", -86.7816, 36.1627},
    {"music city", -86.7816, 36.1627},

    {"salt lake city", -111.891, 40.7608},
    {"slc", -111.891, 40.7608},

    {"honolulu", -157.8583, 21.3069},
    {"anchorage", -149.9003, 61.2181},

    // Europe
    {"london", -0.1276, 51.5074},
    {"the big smoke", -0.1276, 51.5074},

    {"paris", 2.3522, 48.8566},
    {"city of light", 2.3522, 48.8566},
    {"city of lights", 2.3522, 48.8566},

    {"berlin", 13.405, 52.52},
    {"munich", 11.582, 48.1351},
    {"muenchen", 11.582, 48.1351},
    {"frankfurt", 8.6821, 50.1109},
    {"hamburg", 9.9937, 53.5511},

    {"rome", 12.4964, 41.9028},
    {"roma", 12.4964, 41.9028},
    {"the eternal city", 12.4964, 41.9028},
    {"milan", 9.19, 45.4642},
    {"milano", 9.19, 45.4642},
    {"venice", 12.3155, 45.4408},
    {"venezia", 12.3155, 45.4408},
    {"florence", 11.2558, 43.7696},
    {"firenze", 11.2558, 43.7696},
    {"naples", 14.2681, 40.8518},
    {"napoli", 14.2681, 40.8518},

    {"madrid", -3.7038, 40.4168},
    {"barcelona", 2.1734, 41.3851},
    {"barca", 2.1734, 41.3851},
    {"seville", -5.9845, 37.3891},
    {"sevilla", -5.9845, 37.3891},
    {"valencia", -0.3763, 39.4699},

    {"amsterdam", 4.9041, 52.3676},
    {"the dam", 4.9041, 52.3676},

    {"brussels", 4.3517, 50.8503},
    {"bruxelles", 4.3517, 50.8503},

    {"vienna", 16.3738, 48.2082},
    {"wien", 16.3738, 48.2082},

    {"zurich", 8.5417, 47.3769},
    {"zuerich", 8.5417, 47.3769},
    {"geneva", 6.1432, 46.2044},
    {"geneve", 6.1432, 46.2044},

    {"prague", 14.4378, 50.0755},
    {"praha", 14.4378, 50.0755},
    {"budapest", 19.0402, 47.4979},
    {"warsaw", 21.0122, 52.2297},
    {"warszawa", 21.0122, 52.2297},

    {"moscow", 37.6173, 55.7558},
    {"moskva", 37.6173, 55.7558},
    {"saint petersburg", 30.3351, 59.9343},
    {"st petersburg", 30.3351, 59.9343},

    {"stockholm", 18.0686, 59.3293},
    {"oslo", 10.7522, 59.9139},
    {"copenhagen", 12.5683, 55.6761},
    {"kobenhavn", 12.5683, 55.6761},
    {"helsinki", 24.9384, 60.1699},
    {"reykjavik", -21.9426, 64.1466},

    {"dublin", -6.2603, 53.3498},
    {"edinburgh", -3.1883, 55.9533},
    {"glasgow", -4.2518, 55.8642},
    {"manchester", -2.2426, 53.4808},
    {"liverpool", -2.9916, 53.4084},
    {"birmingham uk", -1.8904, 52.4862},

    {"athens", 23.7275, 37.9838},
    {"athina", 23.7275, 37.9838},

    {"lisbon", -9.1393, 38.7223},
    {"lisboa", -9.1393, 38.7223},

    // Asia
    {"tokyo", 139.6917, 35.6895},
    {"osaka", 135.5022, 34.6937},
    {"kyoto", 135.7681, 35.0116},
    {"nagoya", 136.9066, 35.1815},
    {"yokohama", 139.6380, 35.4437},
    {"sapporo", 141.3545, 43.0618},

    {"beijing", 116.4074, 39.9042},
    {"peking", 116.4074, 39.9042},
    {"shanghai", 121.4737, 31.2304},
    {"hong kong", 114.1694, 22.3193},
    {"hk", 114.1694, 22.3193},
    {"guangzhou", 113.2644, 23.1291},
    {"shenzhen", 114.0579, 22.5431},
    {"chengdu", 104.0665, 30.5728},
    {"xian", 108.9402, 34.3416},
    {"xi'an", 108.9402, 34.3416},
    {"hangzhou", 120.1551, 30.2741},

    {"seoul", 126.978, 37.5665},
    {"busan", 129.0756, 35.1796},

    {"taipei", 121.5654, 25.033},
    {"taichung", 120.6736, 24.1477},

    {"singapore", 103.8198, 1.3521},
    {"the lion city", 103.8198, 1.3521},

    {"bangkok", 100.5018, 13.7563},
    {"krung thep", 100.5018, 13.7563},

    {"kuala lumpur", 101.6869, 3.139},
    {"kl", 101.6869, 3.139},

    {"jakarta", 106.8456, -6.2088},
    {"bali", 115.1889, -8.4095},
    {"denpasar", 115.2126, -8.6705},

    {"manila", 120.9842, 14.5995},
    {"hanoi", 105.8342, 21.0278},
    {"ho chi minh city", 106.6297, 10.8231},
    {"saigon", 106.6297, 10.8231},

    {"mumbai", 72.8777, 19.076},
    {"bombay", 72.8777, 19.076},
    {"delhi", 77.1025, 28.7041},
    {"new delhi", 77.209, 28.6139},
    {"bangalore", 77.5946, 12.9716},
    {"bengaluru", 77.5946, 12.9716},
    {"kolkata", 88.3639, 22.5726},
    {"calcutta", 88.3639, 22.5726},
    {"chennai", 80.2707, 13.0827},
    {"madras", 80.2707, 13.0827},
    {"hyderabad india", 78.4867, 17.385},

    {"dubai", 55.2708, 25.2048},
    {"abu dhabi", 54.3773, 24.4539},
    {"doha", 51.5310, 25.2854},
    {"riyadh", 46.7219, 24.7136},
    {"jeddah", 39.1925, 21.4858},
    {"tehran", 51.389, 35.6892},
    {"tel aviv", 34.7818, 32.0853},
    {"jerusalem", 35.2137, 31.7683},
    {"istanbul", 28.9784, 41.0082},
    {"ankara", 32.8597, 39.9334},

    // Oceania
    {"sydney", 151.2093, -33.8688},
    {"melbourne", 144.9631, -37.8136},
    {"brisbane", 153.0251, -27.4698},
    {"perth", 115.8605, -31.9505},
    {"adelaide", -138.6007, -34.9285},
    {"auckland", 174.7633, -36.8485},
    {"wellington", 174.7762, -41.2865},
    {"christchurch", 172.6362, -43.5321},

    // Africa
    {"cairo", 31.2357, 30.0444},
    {"cape town", 18.4241, -33.9249},
    {"johannesburg", 28.0473, -26.2041},
    {"joburg", 28.0473, -26.2041},
    {"nairobi", 36.8219, -1.2921},
    {"lagos", 3.3792, 6.5244},
    {"casablanca", -7.5898, 33.5731},
    {"marrakech", -7.9811, 31.6295},
    {"tunis", 10.1658, 36.8065},
    {"addis ababa", 38.7578, 9.0054},

    // South America
    {"sao paulo", -46.6333, -23.5505},
    {"rio de janeiro", -43.1729, -22.9068},
    {"rio", -43.1729, -22.9068},
    {"brasilia", -47.8825, -15.7942},
    {"buenos aires", -58.3816, -34.6037},
    {"ba", -58.3816, -34.6037},
    {"santiago", -70.6693, -33.4489},
    {"lima", -77.0428, -12.0464},
    {"bogota", -74.0721, 4.711},
    {"medellin", -75.5636, 6.2476},
    {"caracas", -66.9036, 10.4806},
    {"montevideo", -56.1645, -34.9011},
    {"quito", -78.4678, -0.1807},

    // Central America & Caribbean
    {"mexico city", -99.1332, 19.4326},
    {"cdmx", -99.1332, 19.4326},
    {"guadalajara", -103.3496, 20.6597},
    {"cancun", -86.8515, 21.1619},
    {"havana", -82.3666, 23.1136},
    {"la habana", -82.3666, 23.1136},
    {"san juan", -66.1057, 18.4655},
    {"panama city", -79.5199, 8.9824},
    {"kingston", -76.7936, 17.9714},
    {"nassau", -77.3963, 25.0443},

    // Canada
    {"toronto", -79.3832, 43.6532},
    {"the 6", -79.3832, 43.6532},
    {"the six", -79.3832, 43.6532},
    {"vancouver", -123.1207, 49.2827},
    {"montreal", -73.5673, 45.5017},
    {"mtl", -73.5673, 45.5017},
    {"calgary", -114.0719, 51.0447},
    {"ottawa", -75.6972, 45.4215},
    {"edmonton", -113.4909, 53.5461},
    {"quebec city", -71.2082, 46.8139},
    {"winnipeg", -97.1384, 49.8951},

    // =========================================================================
    // Famous Landmarks
    // =========================================================================

    // United States Landmarks
    {"eiffel tower", 2.2945, 48.8584},
    {"la tour eiffel", 2.2945, 48.8584},
    {"statue of liberty", -74.0445, 40.6892},
    {"lady liberty", -74.0445, 40.6892},
    {"golden gate bridge", -122.4783, 37.8199},
    {"grand canyon", -112.1401, 36.0544},
    {"mount rushmore", -103.4591, 43.8791},
    {"times square", -73.9855, 40.758},
    {"central park", -73.9654, 40.7829},
    {"empire state building", -73.9857, 40.7484},
    {"white house", -77.0365, 38.8977},
    {"capitol building", -77.0091, 38.8899},
    {"us capitol", -77.0091, 38.8899},
    {"lincoln memorial", -77.0502, 38.8893},
    {"washington monument", -77.0353, 38.8895},
    {"space needle", -122.3493, 47.6205},
    {"hollywood sign", -118.3217, 34.1341},
    {"alcatraz", -122.4229, 37.8267},
    {"alcatraz island", -122.4229, 37.8267},
    {"yellowstone", -110.5885, 44.428},
    {"yellowstone national park", -110.5885, 44.428},
    {"yosemite", -119.5383, 37.8651},
    {"yosemite national park", -119.5383, 37.8651},
    {"niagara falls", -79.0377, 43.0962},
    {"pearl harbor", -157.9394, 21.3649},
    {"uss arizona memorial", -157.9500, 21.3647},
    {"hoover dam", -114.7377, 36.0160},
    {"mount everest", 86.925, 27.9881},
    {"everest", 86.925, 27.9881},

    // European Landmarks
    {"big ben", -0.1246, 51.5007},
    {"tower of london", -0.0759, 51.5081},
    {"buckingham palace", -0.1419, 51.5014},
    {"london eye", -0.1195, 51.5033},
    {"stonehenge", -1.8262, 51.1789},
    {"colosseum", 12.4922, 41.8902},
    {"the colosseum", 12.4922, 41.8902},
    {"vatican", 12.4534, 41.9029},
    {"vatican city", 12.4534, 41.9029},
    {"st peter's basilica", 12.4534, 41.9022},
    {"sistine chapel", 12.4545, 41.9029},
    {"leaning tower of pisa", 10.3966, 43.723},
    {"pisa", 10.3966, 43.723},
    {"acropolis", 23.7257, 37.9715},
    {"the acropolis", 23.7257, 37.9715},
    {"parthenon", 23.7265, 37.9715},
    {"notre dame", 2.3499, 48.853},
    {"notre-dame", 2.3499, 48.853},
    {"louvre", 2.3376, 48.8606},
    {"the louvre", 2.3376, 48.8606},
    {"arc de triomphe", 2.295, 48.8738},
    {"versailles", 2.1204, 48.8049},
    {"palace of versailles", 2.1204, 48.8049},
    {"neuschwanstein", 10.7498, 47.5576},
    {"neuschwanstein castle", 10.7498, 47.5576},
    {"brandenburg gate", 13.3777, 52.5163},
    {"sagrada familia", 2.1744, 41.4036},
    {"la sagrada familia", 2.1744, 41.4036},
    {"alhambra", -3.5886, 37.1761},
    {"the alhambra", -3.5886, 37.1761},
    {"red square", 37.6213, 55.7539},
    {"kremlin", 37.6176, 55.752},
    {"the kremlin", 37.6176, 55.752},
    {"hagia sophia", 28.9801, 41.0086},
    {"blue mosque", 28.9766, 41.0054},

    // Asian Landmarks
    {"great wall of china", 116.5704, 40.4319},
    {"great wall", 116.5704, 40.4319},
    {"forbidden city", 116.3972, 39.9169},
    {"the forbidden city", 116.3972, 39.9169},
    {"tiananmen square", 116.3912, 39.9054},
    {"terracotta army", 109.2782, 34.3848},
    {"terracotta warriors", 109.2782, 34.3848},
    {"the bund", 121.4905, 31.2379},
    {"mount fuji", 138.7274, 35.3606},
    {"fuji", 138.7274, 35.3606},
    {"fujisan", 138.7274, 35.3606},
    {"tokyo tower", 139.7454, 35.6586},
    {"tokyo skytree", 139.8107, 35.7101},
    {"fushimi inari", 135.7727, 34.9671},
    {"fushimi inari shrine", 135.7727, 34.9671},
    {"gyeongbokgung", 126.977, 37.5796},
    {"gyeongbokgung palace", 126.977, 37.5796},
    {"taj mahal", 78.0421, 27.1751},
    {"the taj mahal", 78.0421, 27.1751},
    {"angkor wat", 103.867, 13.4125},
    {"petra", 35.4444, 30.3285},
    {"the treasury petra", 35.4514, 30.3228},
    {"burj khalifa", 55.2744, 25.1972},
    {"palm jumeirah", 55.1386, 25.1124},
    {"marina bay sands", 103.8612, 1.2838},
    {"gardens by the bay", 103.8636, 1.2816},

    // Oceania & Pacific Landmarks
    {"sydney opera house", 151.2153, -33.8568},
    {"the opera house", 151.2153, -33.8568},
    {"harbour bridge", 151.2108, -33.8523},
    {"sydney harbour bridge", 151.2108, -33.8523},
    {"uluru", 131.0369, -25.3444},
    {"ayers rock", 131.0369, -25.3444},
    {"great barrier reef", 145.7725, -16.2864},

    // South American Landmarks
    {"christ the redeemer", -43.2105, -22.9519},
    {"cristo redentor", -43.2105, -22.9519},
    {"machu picchu", -72.545, -13.1631},
    {"machu pichu", -72.545, -13.1631},
    {"iguazu falls", -54.4367, -25.6953},
    {"iguacu falls", -54.4367, -25.6953},
    {"copacabana beach", -43.1826, -22.9711},
    {"sugarloaf mountain", -43.1575, -22.9491},
    {"pao de acucar", -43.1575, -22.9491},

    // African Landmarks
    {"pyramids of giza", 31.1342, 29.9792},
    {"great pyramid", 31.1342, 29.9792},
    {"the pyramids", 31.1342, 29.9792},
    {"sphinx", 31.1376, 29.9753},
    {"the sphinx", 31.1376, 29.9753},
    {"table mountain", 18.4039, -33.9628},
    {"victoria falls", 25.8572, -17.9243},
    {"serengeti", 34.8333, -2.3333},
    {"kilimanjaro", 37.3556, -3.0674},
    {"mount kilimanjaro", 37.3556, -3.0674},

    // =========================================================================
    // Scientific Facilities & Research Centers
    // =========================================================================

    {"cern", 6.0554, 46.2330},
    {"large hadron collider", 6.0554, 46.2330},
    {"lhc", 6.0554, 46.2330},
    {"fermilab", -88.2575, 41.8319},
    {"fermi national lab", -88.2575, 41.8319},
    {"mit", -71.0942, 42.3601},
    {"massachusetts institute of technology", -71.0942, 42.3601},
    {"stanford", -122.1697, 37.4275},
    {"stanford university", -122.1697, 37.4275},
    {"caltech", -118.1253, 34.1377},
    {"california institute of technology", -118.1253, 34.1377},
    {"jpl", -118.1753, 34.2013},
    {"jet propulsion laboratory", -118.1753, 34.2013},
    {"nasa goddard", -76.8527, 38.9897},
    {"goddard space flight center", -76.8527, 38.9897},
    {"nasa houston", -95.0930, 29.5519},
    {"johnson space center", -95.0930, 29.5519},
    {"cape canaveral", -80.6077, 28.3922},
    {"kennedy space center", -80.6508, 28.5728},
    {"ksc", -80.6508, 28.5728},
    {"vandenberg", -120.5724, 34.7420},
    {"vandenberg space force base", -120.5724, 34.7420},
    {"los alamos", -106.3031, 35.8800},
    {"los alamos national lab", -106.3031, 35.8800},
    {"lanl", -106.3031, 35.8800},
    {"sandia labs", -106.5676, 35.0539},
    {"sandia national laboratories", -106.5676, 35.0539},
    {"lawrence livermore", -121.7111, 37.6887},
    {"llnl", -121.7111, 37.6887},
    {"oak ridge", -84.2696, 35.9315},
    {"oak ridge national lab", -84.2696, 35.9315},
    {"ornl", -84.2696, 35.9315},
    {"brookhaven", -72.8868, 40.8692},
    {"brookhaven national lab", -72.8868, 40.8692},
    {"bnl", -72.8868, 40.8692},
    {"argonne", -87.9800, 41.7172},
    {"argonne national lab", -87.9800, 41.7172},
    {"anl", -87.9800, 41.7172},
    {"slac", -122.2004, 37.4196},
    {"stanford linear accelerator", -122.2004, 37.4196},
    {"ligo hanford", -119.4079, 46.4552},
    {"ligo livingston", -90.7742, 30.5629},
    {"desy", 9.8790, 53.5762},
    {"deutsches elektronen-synchrotron", 9.8790, 53.5762},
    {"max planck", 11.6699, 48.2486},
    {"iter", 5.7717, 43.7076},
    {"international thermonuclear experimental reactor", 5.7717, 43.7076},
    {"esa headquarters", 2.3089, 48.8497},
    {"european space agency", 2.3089, 48.8497},
    {"roscosmos", 37.5177, 55.7065},
    {"baikonur", 63.3050, 45.9650},
    {"baikonur cosmodrome", 63.3050, 45.9650},
    {"jiuquan", 100.2917, 40.9606},
    {"jiuquan satellite launch center", 100.2917, 40.9606},
    {"isro", 77.5116, 13.0297},
    {"indian space research organisation", 77.5116, 13.0297},
    {"jaxa", 139.5521, 35.6762},
    {"japan aerospace exploration agency", 139.5521, 35.6762},
    {"tanegashima", 130.9739, 30.4028},
    {"tanegashima space center", 130.9739, 30.4028},

    // =========================================================================
    // Major Airports (IATA codes)
    // =========================================================================

    {"jfk", -73.7781, 40.6413},
    {"jfk airport", -73.7781, 40.6413},
    {"john f kennedy airport", -73.7781, 40.6413},
    {"lax", -118.4085, 33.9416},
    {"lax airport", -118.4085, 33.9416},
    {"los angeles international", -118.4085, 33.9416},
    {"ord", -87.9073, 41.9742},
    {"ohare", -87.9073, 41.9742},
    {"o'hare", -87.9073, 41.9742},
    {"chicago ohare", -87.9073, 41.9742},
    {"sfo", -122.3789, 37.6213},
    {"sfo airport", -122.3789, 37.6213},
    {"san francisco international", -122.3789, 37.6213},
    {"sea", -122.3088, 47.4502},
    {"seatac", -122.3088, 47.4502},
    {"seattle tacoma airport", -122.3088, 47.4502},
    {"bos", -71.0096, 42.3656},
    {"logan airport", -71.0096, 42.3656},
    {"boston logan", -71.0096, 42.3656},
    {"mia", -80.2870, 25.7959},
    {"miami international", -80.2870, 25.7959},
    {"dfw airport", -97.0403, 32.8998},
    {"dallas fort worth airport", -97.0403, 32.8998},
    {"hartsfield jackson", -84.4281, 33.6407},
    {"atlanta airport", -84.4281, 33.6407},
    {"denver international", -104.6737, 39.8561},
    {"dia", -104.6737, 39.8561},
    {"lhr", -0.4543, 51.4700},
    {"heathrow", -0.4543, 51.4700},
    {"london heathrow", -0.4543, 51.4700},
    {"cdg", 2.5479, 49.0097},
    {"charles de gaulle", 2.5479, 49.0097},
    {"paris cdg", 2.5479, 49.0097},
    {"fra", 8.5622, 50.0379},
    {"frankfurt airport", 8.5622, 50.0379},
    {"ams", 4.7639, 52.3086},
    {"schiphol", 4.7639, 52.3086},
    {"amsterdam schiphol", 4.7639, 52.3086},
    {"dxb", 55.3644, 25.2532},
    {"dubai international", 55.3644, 25.2532},
    {"hnd", 139.7798, 35.5494},
    {"haneda", 139.7798, 35.5494},
    {"tokyo haneda", 139.7798, 35.5494},
    {"nrt", 140.3929, 35.7720},
    {"narita", 140.3929, 35.7720},
    {"tokyo narita", 140.3929, 35.7720},
    {"pek", 116.4074, 40.0799},
    {"beijing capital", 116.4074, 40.0799},
    {"pvg", 121.8051, 31.1443},
    {"shanghai pudong", 121.8051, 31.1443},
    {"hkg", 113.9185, 22.3080},
    {"hong kong airport", 113.9185, 22.3080},
    {"sin", 103.9915, 1.3644},
    {"changi", 103.9915, 1.3644},
    {"singapore changi", 103.9915, 1.3644},
    {"icn", 126.4407, 37.4602},
    {"incheon", 126.4407, 37.4602},
    {"seoul incheon", 126.4407, 37.4602},
    {"bkk", 100.7501, 13.6900},
    {"suvarnabhumi", 100.7501, 13.6900},
    {"bangkok airport", 100.7501, 13.6900},
    {"syd", 151.1753, -33.9399},
    {"sydney airport", 151.1753, -33.9399},
    {"mel", 144.8410, -37.6690},
    {"melbourne airport", 144.8410, -37.6690},
    {"gru", -46.4735, -23.4356},
    {"guarulhos", -46.4735, -23.4356},
    {"sao paulo airport", -46.4735, -23.4356},
    {"eze", -58.5358, -34.8222},
    {"ezeiza", -58.5358, -34.8222},
    {"buenos aires airport", -58.5358, -34.8222},
    {"yyz", -79.6248, 43.6777},
    {"toronto pearson", -79.6248, 43.6777},
    {"yvr", -123.1792, 49.1951},
    {"vancouver airport", -123.1792, 49.1951},
    {"yul", -73.7408, 45.4706},
    {"montreal trudeau", -73.7408, 45.4706},

    // End marker
    {nullptr, 0, 0}
};

// Number of locations (excluding end marker)
static constexpr size_t LOCATION_COUNT = sizeof(LOCATIONS) / sizeof(LOCATIONS[0]) - 1;

void normalize_location_name(const char* input, char* output, size_t output_size) {
    if (output_size == 0) return;

    size_t i = 0;
    size_t j = 0;

    // Skip leading whitespace
    while (input[i] != '\0' && (input[i] == ' ' || input[i] == '\t')) {
        i++;
    }

    // Convert to lowercase and copy
    while (input[i] != '\0' && j < output_size - 1) {
        char c = input[i];
        if (c >= 'A' && c <= 'Z') {
            output[j] = c + ('a' - 'A');
        } else {
            output[j] = c;
        }
        i++;
        j++;
    }

    // Remove trailing whitespace
    while (j > 0 && (output[j - 1] == ' ' || output[j - 1] == '\t')) {
        j--;
    }

    output[j] = '\0';
}

bool resolve_location(const char* name, double& longitude, double& latitude) {
    char normalized[256];
    normalize_location_name(name, normalized, sizeof(normalized));

    for (size_t i = 0; i < LOCATION_COUNT; i++) {
        if (LOCATIONS[i].name != nullptr &&
            std::strcmp(normalized, LOCATIONS[i].name) == 0) {
            longitude = LOCATIONS[i].longitude;
            latitude = LOCATIONS[i].latitude;
            return true;
        }
    }

    return false;
}

const Location* get_all_locations() {
    return LOCATIONS;
}

size_t get_location_count() {
    return LOCATION_COUNT;
}

size_t search_locations(const char* prefix, const Location** results, size_t max_results) {
    char normalized[256];
    normalize_location_name(prefix, normalized, sizeof(normalized));
    size_t prefix_len = std::strlen(normalized);

    size_t count = 0;
    for (size_t i = 0; i < LOCATION_COUNT && count < max_results; i++) {
        if (LOCATIONS[i].name != nullptr &&
            std::strncmp(normalized, LOCATIONS[i].name, prefix_len) == 0) {
            results[count++] = &LOCATIONS[i];
        }
    }

    return count;
}

}  // namespace mcp
}  // namespace cesium
