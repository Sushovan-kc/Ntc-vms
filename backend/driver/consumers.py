# # driver/consumers.py
# import json
# from channels.generic.websocket import AsyncWebsocketConsumer

# class TrackingConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         # Read the dispatch_id passed dynamically from the WebSocket URL string
#         self.dispatch_id = self.scope['url_route']['kwargs']['dispatch_id']
#         self.group_name = f"dispatch_{self.dispatch_id}"

#         # Assign the incoming connection straight to this trip's streaming room
#         await self.channel_layer.group_add(self.group_name, self.channel_name)
#         await self.accept()

#     async def disconnect(self, close_code):
#         # Leave the streaming room when browser tab or map closes
#         await self.channel_layer.group_discard(self.group_name, self.channel_name)

#     async def broadcast_location(self, event):
#         # Pushes coordinates straight out to your React app map view
#         await self.send(text_data=json.dumps(event["data"]))
