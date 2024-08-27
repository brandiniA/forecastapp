import { useCallback, useEffect, useRef, useState } from 'react'
import { getCities, getForeCast } from '../../lib/api'
import AsyncSelect from 'react-select/async';
import GridLoader  from "react-spinners/GridLoader";

const useGetForecast = (selectedCity) => {
    const lastCity = useRef(null)
    const [fetched, setFetched] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [data, setData] = useState([])
    const [retry, setRetry] = useState(0)
    
    const getForecast = useCallback(async(selectedCity) => {
        const { lat, long } = selectedCity;
        setFetching(true)
        if (!fetched) setFetched(true)

        setData([])
        const $forecasts = await getForeCast({ lat, long })
        setData($forecasts)
        setFetching(false)
    }, [fetched])

    useEffect(() => {
        if (selectedCity && (lastCity.current !== selectedCity.value || retry > 0)) {
            lastCity.current = selectedCity.value
            getForecast(selectedCity)
        }
    }, [selectedCity, getForecast, retry])

    const triggerRetry = () => setRetry((prev) => prev + 1)

    return {
        data,
        fetched,
        fetching,
        retry: triggerRetry
    }
}

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

    const loadOptions = async (city, callback) => {
        const $cities = await getCities(city)

        callback($cities
            .map(({
                city_name,
                country,
                state,
                id,
                lat,
                long
            }) => {
                return {
                    value: id,
                    label: `${city_name}, ${state}, ${country}`,
                    lat,
                    long

                }
            }
        ))
    }

    const {
        data: forecasts,
        fetched,
        fetching,
        retry
    } = useGetForecast(selectedCity)

    return (
        <div className='h-full flex flex-row'>
            <div className='relative bg-white border border-gray-200 shadow-sm w-[450px] min-w-[450px] px-7 pt-5 pb-10'>
                {/* Header */}
                <div>
                    <h1 className='font-bold text-2xl'>Consulta el Clima en tu Destino</h1>
                    <span className='text-lg'>Ingresa tu destino para ver el pronóstico del clima.</span>
                </div>
                <div className='mt-4'>
                    <AsyncSelect
                        cacheOptions
                        loadOptions={loadOptions}
                        onChange={setSelectedCity}
                        placeholder="Ej: Monterrey, Guadalajara, Saltillo" 
                        noOptionsMessage={() => 'No se encontraron resultados'}
                    />
                </div>
            </div>
           
            {selectedCity && (
                <div className='flex-1 flex flex-col items-center pt-8 px-8 w-full h-full'>
                    <div className='text-center'>
                        <h1 className='text-4xl font-semibold'>{selectedCity?.label}</h1>
                    </div>
                    <GridLoader
                        color={"#d1d5db"}
                        loading={fetching}
                        size={30}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                        className='mt-16 mx-auto'
                    />
                    {fetched && !fetching && forecasts.length === 0 && (
                            <div className='flex flex-col items-center mt-12'>
                                <div className='text-xl'>Hubo un problema, por favor intenta nuevamente.</div>
                                <button
                                    onClick={() => {
                                        retry()
                                    }}
                                    className='mt-4 border-gray-200 border px-4 py-2 rounded-md bg-blue-400 hover:cursor-pointer hover:bg-blue-500'
                                >
                                    Volver a intentar
                                </button>
                            </div>
                        )
                    }
                    {forecasts.length > 0 && (
                        <div className='w-full grid grid-cols-5 gap-4 mt-8'>
                            {forecasts.map((forecast) => {
                                const { dt, display, min, max } = forecast

                                return (
                                    <div key={`forecast-${dt}`} className=''>
                                        <ForecastDay display={display} min={min.toFixed(0)} max={max.toFixed(0)} />
                                    </div>
                                )
                            })}
                        </div>
                        )
                    }
                </div>
            )}
        </div>
    )
}
