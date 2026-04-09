import axios from "axios"
import { API_BASE_URL } from "../api/apiConfig.js"

const bookLawyer = async () => {

  const bookingData = {

    clientId:1,
    lawyerId:2,
    date:"2026-03-20",
    caseDescription:"Property dispute"

  }

  try{

    const res = await axios.post(
      `${API_BASE_URL}/bookings/create`,
      bookingData
    )

    console.log(res.data)

    alert("Booking created!")

  }catch(err){

    console.log(err)

  }

}

export default function Booking(){

  return(

    <div>

      <h1>Book Consultation</h1>

      <button onClick={bookLawyer}>
        Book Lawyer
      </button>

    </div>

  )

}
