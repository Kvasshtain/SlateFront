import {
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
} from "redux-signalr"

const createHubConnection = () => {
  return new HubConnectionBuilder()
    .configureLogging(LogLevel.Information)
    .withUrl("http://localhost:5288/imageExchanging", {
      // skipNegotiation: true,
      // transport: HttpTransportType.WebSockets,
    })
    .build()
}

export default createHubConnection
