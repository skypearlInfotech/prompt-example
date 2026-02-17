<!-- backend command -->
python3 -m venv venv
source venv/bin/activate
uvicorn main:app --reload


<!-- frontend command -->
npm install
npm run dev