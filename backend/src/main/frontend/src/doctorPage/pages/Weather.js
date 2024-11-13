// import { useState, useEffect } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Cloud, Sun, Moon, CloudRain, Wind, Droplets, Thermometer } from "lucide-react";
//
// // Mock data - replace this with actual API calls
// const mockWeatherData = {
//   current: { temp: 22, humidity: 60, windSpeed: 5, description: "Cloudy" },
//   forecast: [
//     { day: "Mon", temp: 20, icon: "cloud" },
//     { day: "Tue", temp: 22, icon: "sun" },
//     { day: "Wed", temp: 19, icon: "cloud-rain" },
//     { day: "Thu", temp: 21, icon: "sun" },
//     { day: "Fri", temp: 23, icon: "sun" }
//   ]
// };
//
// export default function Weather() {
//   const [city, setCity] = useState("Seoul");
//   const [weather, setWeather] = useState(mockWeatherData);
//
//   // useEffect to fetch weather data goes here
//   // useEffect(() => {
//   //   // Fetch weather data from OpenWeatherMap API
//   // }, [city])
//
//   const getWeatherIcon = (icon: string) => {
//     switch (icon) {
//       case "sun":
//         return <Sun className="h-8 w-8" />;
//       case "cloud":
//         return <Cloud className="h-8 w-8" />;
//       case "cloud-rain":
//         return <CloudRain className="h-8 w-8" />;
//       default:
//         return <Sun className="h-8 w-8" />;
//     }
//   };
//
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center p-4">
//       <Card className="w-full max-w-md bg-white/80 backdrop-blur-md">
//         <CardHeader>
//           <CardTitle className="text-2xl font-bold text-center">Weather in {city}</CardTitle>
//           <CardDescription>
//             <div className="flex mt-4">
//               <Input
//                 placeholder="Enter city name"
//                 value={city}
//                 onChange={(e) => setCity(e.target.value)}
//                 className="mr-2"
//               />
//               <Button>Search</Button>
//             </div>
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="text-center mb-6">
//             <div className="text-6xl font-bold mb-2">{weather.current.temp}°C</div>
//             <div className="text-xl">{weather.current.description}</div>
//             <div className="flex justify-center items-center mt-4 space-x-4">
//               <div className="flex items-center">
//                 <Droplets className="mr-1" />
//                 <span>{weather.current.humidity}%</span>
//               </div>
//               <div className="flex items-center">
//                 <Wind className="mr-1" />
//                 <span>{weather.current.windSpeed} m/s</span>
//               </div>
//             </div>
//           </div>
//           <div className="grid grid-cols-5 gap-2 mt-6">
//             {weather.forecast.map((day, index) => (
//               <div key={index} className="text-center">
//                 <div className="font-semibold">{day.day}</div>
//                 {getWeatherIcon(day.icon)}
//                 <div>{day.temp}°C</div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }