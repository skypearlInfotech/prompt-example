# **App Name**: Formify API Caller

## Core Features:

- Input Type Selection: Allow the user to select between text input and file upload for job description and resume.
- Text Input Areas: Provide two textarea fields when the 'text' option is selected: one for the job description and one for the resume text.
- File Upload Buttons: Display two file upload buttons (accepting only PDF files) when the 'file' option is selected: one for the job description and one for the resume.
- File Conversion to Text: Automatically convert uploaded PDF files into text format before sending to the API.
- API Call: Call the specified API with the extracted text from either the textareas or the converted PDF files.
- Formik and Yup Validation: Implement form validation using Formik and Yup to ensure that required fields are filled and files are in the correct format before API call.

## Style Guidelines:

- Color scheme: Dark theme with a deep indigo background (#1A237E).
- Primary color: Vibrant purple (#9C27B0) to create visual interest and highlight interactive elements.
- Accent color: Electric blue (#2979FF) for buttons and key actions to draw attention.
- Body and headline font: 'Inter', a sans-serif, for a modern and clean look, easy to read in a dark layout.
- Single-page layout with clear sections for input selection, text/file inputs, and submit button.
- Use simple, outlined icons in electric blue (#2979FF) to represent file upload and text input actions.
- Subtle animations, like a fade-in effect, on section transitions to enhance user experience.