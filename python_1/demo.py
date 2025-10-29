
print("Hello welcome to Buget and Expence Tracker.")
print("Here you will put all of you data for bugeting.")

import datetime
import time
import os

class BudgetApp:
    def __init__(self):
        self.user = {}
        self.expenses = {"needs": 0, "wants": 0, "savings": 0}
        self.notifications = []
        self.setup_user()

    def clear_terminal(self):
        os.system('cls' if os.name == 'nt' else 'clear')

    def setup_user(self):
        self.clear_terminal()
        print("💰 Welcome to your Budget & Expense Tracker!\nLet's start by setting up your account.\n")

        # Basic info
        self.user["name"] = input("What is your full name? ")
        self.user["age"] = input("What is your age? ")

        # Source of income check
        has_income = input("Do you have a source of income? (yes/no): ").strip().lower()
        if has_income == "yes":
            has_job = input("Do you have a job? (yes/no): ").strip().lower()
            if has_job == "yes":
                self.user["has_job"] = True
                self.user["job_salary"] = float(input("What is your monthly salary? $"))
                self.user["allowance"] = float(input("Do you also get an allowance? (enter 0 if none): $"))
            else:
                self.user["has_job"] = False
                self.user["job_salary"] = 0
                self.user["allowance"] = float(input("How much allowance or other income do you get per month? $"))
        else:
            print("Okay, no problem! We’ll set your income as $0 for now.")
            self.user["has_job"] = False
            self.user["job_salary"] = 0
            self.user["allowance"] = 0

        # Ask how much money they already have saved
        self.user["current_balance"] = float(input("How much money do you already have saved or in hand? $"))

        total_income = self.user["job_salary"] + self.user["allowance"]

        # Budget method
        print("\nWhich budgeting method would you like to use?")
        print("1. 50/30/20 Method (50% Needs, 30% Wants, 20% Savings)")
        print("2. Custom method")
        choice = input("Enter 1 or 2: ")

        if choice == "1":
            self.user["method"] = "50/30/20"
            self.expenses["needs"] = total_income * 0.50
            self.expenses["wants"] = total_income * 0.30
            self.expenses["savings"] = total_income * 0.20
        else:
            print("\nEnter your custom percentage breakdown (must total 100%).")
            needs = float(input("Needs %: "))
            wants = float(input("Wants %: "))
            savings = float(input("Savings %: "))
            self.expenses["needs"] = total_income * (needs / 100)
            self.expenses["wants"] = total_income * (wants / 100)
            self.expenses["savings"] = total_income * (savings / 100)
            self.user["method"] = "Custom"

        # Spending preferences
        self.user["spend_month"] = float(input("\nHow much do you want to spend per month? $"))
        self.user["spend_week"] = float(input("How much do you want to spend per week? $"))
        self.user["spend_day"] = float(input("How much do you want to spend per day? $"))

        # Living situation
        self.user["living_situation"] = input(
            "\nDo you live with your parents or alone? (parents/alone): "
        ).strip().lower()

        if self.user["living_situation"] == "alone":
            self.user["rent_due_date"] = input("When is your rent due each month? (e.g., 25): ")
        else:
            self.user["rent_due_date"] = None
            print("✅ Great! Since you live with your parents, we’ll skip rent tracking.")

        # Tax questions
        pays_tax = input("\nDo you pay taxes? (yes/no): ").strip().lower()
        if pays_tax == "yes":
            self.user["pays_tax"] = True
            self.user["tax_amount"] = float(input("About how much do you pay in taxes per month or year? $"))
            self.user["tax_due_month"] = input("When do you usually pay taxes? (e.g., April): ")
        else:
            self.user["pays_tax"] = False
            self.user["tax_amount"] = 0
            self.user["tax_due_month"] = "N/A"

        # Notifications
        notif_choice = input("\nWould you like daily notifications and reminders? (yes/no): ").lower()
        self.user["notifications"] = notif_choice == "yes"

        print("\n✅ Thank you for answering the questions! Redirecting you to your home page...\n")
        time.sleep(2)
        self.show_homepage()

    def show_homepage(self):
        self.clear_terminal()
        print("="*55)
        print(f"🏠 Welcome, {self.user['name']}!")
        print(f"📅 Today: {datetime.date.today().strftime('%B %d, %Y')}")
        print("="*55)
        print(f"Budget Method: {self.user['method']}")
        print(f"Total Monthly Income: ${self.user['job_salary'] + self.user['allowance']:.2f}")
        print(f"Current Balance: ${self.user['current_balance']:.2f}")
        print(f"Needs: ${self.expenses['needs']:.2f}")
        print(f"Wants: ${self.expenses['wants']:.2f}")
        print(f"Savings: ${self.expenses['savings']:.2f}")
        print(f"Spending Goal (Month): ${self.user['spend_month']:.2f}")
        print(f"Living Situation: {self.user['living_situation'].capitalize()}")
        if self.user["living_situation"] == "alone" and self.user["rent_due_date"]:
            print(f"Rent Due on: {self.user['rent_due_date']}th each month")
        if self.user["pays_tax"]:
            print(f"Pays Taxes: Yes (${self.user['tax_amount']:.2f} approx.) in {self.user['tax_due_month']}")
        else:
            print("Pays Taxes: No")
        print("="*55)

        if self.user["notifications"]:
            self.create_notifications()

    def create_notifications(self):
        today = datetime.date.today()
        notifications = []

        # Rent notification
        if self.user["living_situation"] == "alone" and self.user["rent_due_date"]:
            rent_day = int(self.user["rent_due_date"])
            rent_due = datetime.date(today.year, today.month, min(rent_day, 28))
            notifications.append(f"💡 Reminder: Rent due on {rent_due.strftime('%B %d')}.")

        # Tax notification
        if self.user["pays_tax"] and self.user["tax_due_month"].lower() != "n/a":
            notifications.append(f"💰 Remember to plan for taxes in {self.user['tax_due_month']} (${self.user['tax_amount']:.2f}).")

        # Weekly check-in
        pay_day = today + datetime.timedelta(days=7)
        notifications.append(f"📊 Weekly budget update coming on {pay_day.strftime('%A, %B %d')}.")

        self.notifications = notifications

        print("\n🔔 Notifications Scheduled:")
        for n in self.notifications:
            print("-", n)
        print("="*55)


if __name__ == "__main__":
    BudgetApp()