import 'dayjs/locale/es-mx';
import dayjs from "dayjs";
// dayjs.locale('es-mx')

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const API_KEY = '0eebd1fcf852d29ca0340c5c451d4c9a'

export const getCities = async(city) => {
    try {
        const res = await fetch(`https://search.reservamos.mx/api/v2/places?q=${city}`)
        const cities = (await res.json()).filter((v) => v.result_type === 'city')

        return cities
    } catch (error) {
        console.log(error)
        return  []
    }
}

export const getForeCast = async({ lat, long }) => {
    await delay(200)

    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${API_KEY}&units=metric`)
        const forecasts = (await res.json()).list;
    
        const dict = {}
        forecasts.forEach(({ dt, main: { temp_min, temp_max } }) => {
            const date = dayjs.unix(dt)
            const day = dayjs.unix(dt).date()
            
            if (!dict[day]) {
                dict[day] = {
                    dt,
                    display: date.format('dd DD'),
                    min: temp_min,
                    max: temp_max
                }
            } else {
                dict[day].min = Math.min(dict[day].min, temp_min);
                dict[day].max = Math.max(dict[day].max, temp_max);
            }
    
        })
    
        const newForecasts = Object.values(dict).sort((a,b) => a.dt - b.dt)
    
        if (newForecasts.length > 5) newForecasts.pop()
    
        return newForecasts
    } catch (error) {
        console.log(error)
        return []
    }
}