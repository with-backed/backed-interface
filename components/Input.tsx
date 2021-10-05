import { useState, useEffect } from "react";
import $ from 'jquery';


export default function Input({type, title, placeholder, value, error, message, setValue}){
    const [v, setV] = useState('')

    const handleChange = (event) => {
        console.log(`event value ${event.target.value}`)
        setV(event.target.value)
    }

    useEffect(() => {
        const timeOutId = setTimeout(() => setValue(v), 500);
        return () => clearTimeout(timeOutId);
      }, [v, error, message]);

    return(
        <div className='input-wrapper'>
            <h4 className='blue'> {title} </h4>
            <input type={type} value={v} placeholder={placeholder} onChange={handleChange} onWheel={(e) => e.currentTarget.blur()}/>
            { error == "" ? '' : <p className='error'>{error}</p> }
            { message == "" ? '' : <p className='message'>{message}</p> }
        </div>
    )
}