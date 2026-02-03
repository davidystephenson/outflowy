# Outflowy

Outflowy is a tool for interacting with Workflowy data outside of Workflowy.
It uses the Workflowy API: <https://beta.workflowy.com/api-reference/>.
The interface shows a form with with five inputs, API Key, Source Node ID, Rejected Node ID, Concerned Node ID, and Accepted Node ID.
The API Key input is obscured like a password, but not the Node IDs.
The API Key is only temporary stored in local component state, but not stored permanently anywhere.
Each time the user submits the form, if any input is empty, the user is alerted about what is missing.
If everything is provided, the API Key and Source Node ID are sent to an API route that responds with a single random incomplete direct child of the node with the Source ID and the name of that child's incomplete children nodes recursively.
While the data is loading, a "Loading..." message appears.
The UI displays the recursive hierarchy with nested bullet points, embedding the name as HTML.
Below the bullet points are three buttons, Reject, Concern, and Accept.
If the user clicks the Reject button, the displayed node is moved to the node with the Rejected Node ID.
If the user clicks the Concern button, the displayed node is moved to the node with the Concerned Node ID.
If the user clicks the Accept button, the displayed node is moved to the node with the Accepted Node ID.
After any of these buttons are clicked, a new random incomplete direct child of the node with the Source ID is displayed.
If any of the target nodes do not exist, the UI alerts an error explaining the issue.
While any button operation is ongoing, all buttons and the form should be disabled.
If any error occurs, display the message in an alert.
Submitting the form should not clear it to support resubmission.
The app is unstyled.
