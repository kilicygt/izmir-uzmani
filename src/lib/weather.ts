export interface DailyForecast {
    day: string;
    temp: number;
    icon: string;
    condition: string;
}

const API_KEY = 'f12375814bd0424bb85194239260201';

const ICONS = {
    sunny: '<svg class="h-4 w-4 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>',
    cloudy: '<svg class="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>',
    rainy: '<svg class="h-4 w-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 16.2A4.5 4.5 0 0017.5 8 4.5 4.5 0 0013 12.2a2.3 2.3 0 00-1 0A4.5 4.5 0 007.5 8 4.5 4.5 0 005 12.2C2.2 13 0 15.2 0 18s2.2 5 5 5h14c2.8 0 5-2.2 5-5s-2.2-5-5-5zM15 16l-2 2-2-2"/></svg>'
};

function getIconForCondition(code: number): string {
    // WeatherAPI.com condition codes
    // 1000: Sunny/Clear
    // 1003, 1006, 1009: Partly cloudy, Cloudy, Overcast
    // 1063+: Rain/Snow/etc
    if (code === 1000) return ICONS.sunny;
    // WeatherAPI codes for rain/snow/sleet generally start from 1063 upwards.
    // We explicitly exclude common cloudy codes (1003, 1006, 1009) from being classified as rainy.
    if (code >= 1063 && ![1003, 1006, 1009].includes(code)) return ICONS.rainy;
    return ICONS.cloudy;
}

// Mock Data Generator
function getMockWeather(): DailyForecast[] {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    return days.map((day, i) => {
        const isSunny = Math.random() > 0.3;
        return {
            day,
            temp: 20 + Math.floor(Math.random() * 8), // 20-28°C
            icon: isSunny ? ICONS.sunny : ICONS.cloudy,
            condition: isSunny ? 'Güneşli' : 'Parçalı Bulutlu'
        };
    });
}

export async function getWeatherForecast(): Promise<DailyForecast[]> {
    try {
        // Fetch from WeatherAPI.com
        const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=Izmir&days=7&lang=tr`);

        if (!response.ok) {
            throw new Error(`Weather API Error: ${response.status}`);
        }

        const data = await response.json();
        const forecastDays = data.forecast.forecastday as any[];

        return forecastDays.map((item) => {
            const date = new Date(item.date);
            // Fix day name to Turkish locale manually if server doesn't provide easy way or just leverage JS
            const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });

            return {
                day: dayName,
                temp: Math.round(item.day.avgtemp_c),
                icon: getIconForCondition(item.day.condition.code),
                condition: item.day.condition.text
            };
        });

    } catch (error) {
        console.error('Weather Fetch Error relying on mock:', error);
        return getMockWeather();
    }
}
