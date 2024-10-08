import {
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
} from "redux-signalr"

const createHubConnection = (token: string) => {
  return new HubConnectionBuilder()
    .configureLogging(LogLevel.Information)
    .withUrl("http://localhost:5288/imageExchanging", {
      // skipNegotiation: true,
      // transport: HttpTransportType.WebSockets,
      accessTokenFactory: () => token,
    })
    .build()
}

export default createHubConnection
