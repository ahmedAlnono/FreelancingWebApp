// services/signalRService.ts
import * as signalR from '@microsoft/signalr';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  
  async connect(token: string) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.REACT_APP_API_URL}/hubs/notification`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();
    
    this.connection.on("ReceiveNotification", (notification) => {
      console.log("New notification:", notification);
      // Show toast notification
    });
    
    this.connection.on("NewProposal", (data) => {
      console.log(`New proposal for job ${data.jobId} from ${data.freelancerName}`);
    });
    
    await this.connection.start();
    console.log("SignalR connected");
  }
  
  async joinJobRoom(jobId: number) {
    await this.connection?.invoke("JoinJobRoom", jobId);
  }
}

export const signalRService = new SignalRService();