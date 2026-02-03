# Outflowy

Outflowy is a tool for interacting with Workflowy data outside of Workflowy.
It uses the Workflowy API: <https://beta.workflowy.com/api-reference/>.
The interface shows a form with with two inputs, API Key and Node ID.
The API Key input is obscured like a password, but not the Node ID.
The API Key is not stored anywhere.
Each time the user submits the form, if the API Key or Node ID are missing, the user is alerted about what is missing.
If both are provided, the name of a single random incomplete direct child of the IDed node appears below, along with the name of that child's incomplete children nodes recursively.
The recursive hierarchy is displayed with nested bullet points.
While the data is loading, a "Loading..." message appears.
If any error occurs, display the message in an alert.
Submitting the form should not clear it to support resubmission.
The app is unstyled.
