import os
import logging
from typing import List, Dict, Any
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

# If modifying these scopes, delete the file token.json.
SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send'
]

class GoogleWorkspaceManager:
    """
    Handles authentication and client instantiation for Google APIs.
    Supports Application Default Credentials (ADC) for cloud-run, 
    but falls back to local token.json for Workspace-specific scopes.
    """
    
    def __init__(self):
        self.creds = None
        self._authenticate()

    def _authenticate(self):
        """Standard OAuth2 flow for Workspace APIs."""
        # The file token.json stores the user's access and refresh tokens.
        if os.path.exists('token.json'):
            self.creds = Credentials.from_authorized_user_file('token.json', SCOPES)
            
        # If there are no (valid) credentials available, let the user log in.
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                try:
                   self.creds.refresh(Request())
                except Exception as e:
                   logger.warning(f"Token refresh failed: {e}")
                   self.creds = None
            
            # NOTE: In a headless environment (like Cloud Run), this flow won't work.
            # We would need the user to provide a JSON string or use a web-based OAuth flow.
            # For now, we provide the architecture for the agent to attempt calls.

    def get_calendar_service(self):
        if not self.creds: return None
        return build('calendar', 'v3', credentials=self.creds)

    def get_gmail_service(self):
        if not self.creds: return None
        return build('gmail', 'v1', credentials=self.creds)

    def list_calendar_events(self, time_min: str = None) -> List[Dict[str, Any]]:
        """Wraps the Calendar API list call."""
        service = self.get_calendar_service()
        if not service:
            return []
            
        try:
            now = time_min or datetime.utcnow().isoformat() + 'Z'
            events_result = service.events().list(
                calendarId='primary', timeMin=now,
                maxResults=10, singleEvents=True,
                orderBy='startTime'
            ).execute()
            return events_result.get('items', [])
        except Exception as e:
            logger.error(f"Calendar API error: {e}")
            return []

    def search_gmail(self, query: str) -> List[Dict[str, Any]]:
        """Wraps Gmail API search."""
        service = self.get_gmail_service()
        if not service:
            return []
            
        try:
            results = service.users().messages().list(userId='me', q=query, maxResults=5).execute()
            messages = results.get('messages', [])
            
            threads = []
            for msg in messages:
                m = service.users().messages().get(userId='me', id=msg['id']).execute()
                snippet = m.get('snippet', '')
                threads.append({"id": msg['id'], "snippet": snippet})
            return threads
        except Exception as e:
            logger.error(f"Gmail API error: {e}")
            return []
