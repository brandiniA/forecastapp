import { useEffect, useState } from 'react'
import { getCities, getForeCast } from '../../lib/api'
import AsyncSelect from 'react-select/async';
import GridLoader  from "react-spinners/GridLoader";

const ForecastDay = ({ display, min, max }) => {
    return (
        <div className='bg-white shadow-md border border-gray-200 rounded-md overflow-hidden'>
            <div>
                <div className='text-center text-4xl text-blue-600 bg-blue-100 pt-6 pb-4'>{display}</div>
                <div className='flex flex-col pt-4 pb-6 bg-blue-50'>
                    {/* <div className='h-32 w-32 mx-auto'>
                        <img className="w-full" src={`https://openweathermap.org/img/w/${icon}.png`} alt={description} />
                    </div> */}
                    <div className='flex flex-row '>
                        <div className='flex-1 text-center text-blue-600'>
                            <div className='text-2xl'>Min</div>
                            <div className='text-[58px] font-semibold'>{min}&deg;</div>
                        </div>
                        <div className='flex-1 text-center text-red-600'>
                            <div className='text-2xl'>Max</div>
                            <div className='text-[58px] font-semibold'>{max}&deg;</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const Forecast = () => {
    const [selectedCity, setSelectedCity] = useState()
    const [forecasts, setForecasts] = useState([])
    const [isloading, setIsLoading] = useState(false)

    const loadOptions = async (city, callback) => {
        const $cities = await getCities(city)

        callback($cities
            .map(({
                city_name,
                country,
                id,
                lat,
                long
            }) => {
                return {
                    value: id,
                    label: `${city_name}, ${country}`,
                    lat,
                    long

                }
            }
        ))
    }

    const fetchForecast = async(selectedCity) => {
        const { lat, long } = selectedCity;
        setForecasts([])
        setIsLoading(true)
        const $forecasts = await getForeCast({ lat, long })
        setForecasts($forecasts)
        setIsLoading(false)
    }

    useEffect(() => {
        if (selectedCity) {
            fetchForecast(selectedCity)
        }
    }, [selectedCity])

    return (
        <div className='h-full flex flex-row'>
            <div className='relative bg-white border border-gray-200 shadow-sm w-[450px] min-w-[450px] px-7 pt-5 pb-10'>
                {/* Header */}
                <div>
                    <h1 className='font-bold text-2xl'>Consulta el Clima en tu Destino</h1>
                    <span className='text-lg'>Ingresa tu destino para ver el pronóstico del clima.</span>
                </div>
                <div className='mt-4'>
                    <AsyncSelect cacheOptions loadOptions={loadOptions} onChange={setSelectedCity} placeholder="Ej: Monterrey, Guadalajara, Saltillo" />
                </div>
            </div>
           
            {selectedCity && (
                <div className='flex-1 flex flex-col items-center pt-8 px-8 w-full h-full'>
                    <div className='text-center'>
                        <h1 className='text-4xl font-semibold'>{selectedCity?.label}</h1>
                    </div>
                    <GridLoader
                        color={"#d1d5db"}
                        loading={isloading}
                        size={30}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                        className='mt-16 mx-auto'
                    />
                    <div className='w-full grid grid-cols-5 gap-4 mt-8'>
                        {forecasts && forecasts.map((forecast) => {
                            const { dt, display, min, max } = forecast

                            return (
                                <div key={`forecast-${dt}`} className=''>
                                    <ForecastDay display={display} min={min.toFixed(0)} max={max.toFixed(0)} />
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
