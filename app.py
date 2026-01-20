import streamlit as st
import random
from datetime import datetime

# -------------------- APP CONFIG --------------------
st.set_page_config(page_title="StudyMate AI", layout="wide")

# -------------------- SESSION STATE --------------------
if "logged_in" not in st.session_state:
    st.session_state.logged_in = False
    st.session_state.user = {}
    st.session_state.subjects = []
    st.session_state.timetable = {}

# -------------------- AUTH UI --------------------
def login_ui():
    st.title("📚 StudyMate AI")
    st.subheader("Smart Study Planner")

    tab1, tab2 = st.tabs(["Login", "Register"])

    with tab1:
        email = st.text_input("Email")
        password = st.text_input("Password", type="password")
        if st.button("Login"):
            st.session_state.logged_in = True
            st.session_state.user = {"email": email, "name": "Student"}
            st.success("Login successful")

    with tab2:
        name = st.text_input("Name")
        email = st.text_input("Email", key="reg")
        password = st.text_input("Password", type="password", key="pass")
        if st.button("Register"):
            st.session_state.logged_in = True
            st.session_state.user = {"email": email, "name": name}
            st.success("Account created")

# -------------------- SUBJECT INPUT --------------------
def subject_ui():
    st.header("➕ Add Subjects")

    with st.form("subject_form"):
        name = st.text_input("Subject Name")
        hours = st.slider("Weekly Hours", 1, 20, 5)
        difficulty = st.radio("Difficulty", ["easy", "medium", "hard"])
        submitted = st.form_submit_button("Add Subject")

        if submitted:
            st.session_state.subjects.append({
                "name": name,
                "hours": hours,
                "difficulty": difficulty,
                "color": "#667eea"
            })
            st.success("Subject added")

# -------------------- TIMETABLE LOGIC --------------------
def generate_timetable(subjects, daily_hours, session_duration, break_duration):
    timetable = {}
    difficulty_weight = {"easy": 1, "medium": 1.5, "hard": 2}

    weighted = []
    for s in subjects:
        sessions = int((s["hours"] * 60) / session_duration)
        weighted += [s] * sessions

    random.shuffle(weighted)

    daily_minutes = daily_hours * 60
    sessions_per_day = daily_minutes // (session_duration + break_duration)

    index = 0
    for day in range(7):
        timetable[day] = []
        current = 9 * 60

        for _ in range(sessions_per_day):
            if index >= len(weighted):
                break

            sub = weighted[index]
            timetable[day].append({
                "subject": sub["name"],
                "start": format_time(current),
                "end": format_time(current + session_duration),
                "type": "study"
            })
            current += session_duration

            timetable[day].append({
                "subject": "Break",
                "start": format_time(current),
                "end": format_time(current + break_duration),
                "type": "break"
            })
            current += break_duration
            index += 1

    return timetable

def format_time(minutes):
    h = minutes // 60
    m = minutes % 60
    period = "PM" if h >= 12 else "AM"
    h = h - 12 if h > 12 else h
    return f"{h}:{str(m).zfill(2)} {period}"

# -------------------- DASHBOARD --------------------
def dashboard():
    st.title(f"Welcome, {st.session_state.user['name']} 👋")

    col1, col2 = st.columns(2)

    with col1:
        subject_ui()

    with col2:
        st.header("⚙ Preferences")
        daily_hours = st.slider("Daily Study Hours", 1, 12, 4)
        session_duration = st.selectbox("Session Duration (mins)", [25, 45, 60])
        break_duration = st.selectbox("Break Duration (mins)", [5, 10, 15])

        if st.button("Generate Timetable"):
            st.session_state.timetable = generate_timetable(
                st.session_state.subjects,
                daily_hours,
                session_duration,
                break_duration
            )
            st.success("Timetable Generated")

    if st.session_state.timetable:
        st.header("📅 Weekly Timetable")
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        for d in range(7):
            st.subheader(days[d])
            for s in st.session_state.timetable[d]:
                st.write(f"🕒 {s['start']} - {s['end']} | {s['subject']}")

# -------------------- MAIN --------------------
if not st.session_state.logged_in:
    login_ui()
else:
    dashboard()
