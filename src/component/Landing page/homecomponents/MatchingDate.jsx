"use client"

import * as React from "react"

import { Calendar } from "./Calendar"
import { Button } from "./button"

const MatchingDate = () => {
  const [date, setDate] = React.useState(new Date())

  return (
   <>
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="sm:w-[220px] sm:px-0 lg:w-[280px]"
    />
    <Button className='w-[110%] sm:w-[116%] lg:w-[100%] text-orange-100 bg-orange-500 rounded-none rounded-l-xl my-3'>Continue</Button>
   </>
  )
}

export default MatchingDate;