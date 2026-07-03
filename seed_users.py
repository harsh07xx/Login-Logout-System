#!/usr/bin/env python3
"""
seed_users.py

Generates a small JSON file of demo accounts that can be used to
manually test the login form (any non-empty email/password pair
works, but this gives testers realistic-looking values).

Usage:
    python3 scripts/seed_users.py [--count N] [--out PATH]
"""
import argparse
import json
import random
import string
from pathlib import Path

FIRST_NAMES = ["Ava", "Liam", "Noah", "Mia", "Ethan", "Zoe", "Kai", "Luna"]
LAST_NAMES = ["Turner", "Patel", "Kim", "Garcia", "Novak", "Reed", "Singh"]
DOMAINS = ["example.com", "mail.test", "demo.dev"]


def random_password(length: int = 10) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$%"
    return "".join(random.choice(alphabet) for _ in range(length))


def build_user() -> dict:
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    email = f"{first.lower()}.{last.lower()}@{random.choice(DOMAINS)}"
    return {
        "name": f"{first} {last}",
        "email": email,
        "password": random_password(),
        "role": random.choice(["Member", "Admin", "Viewer"]),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate demo login accounts")
    parser.add_argument("--count", type=int, default=10, help="number of accounts to generate")
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "demo-users.json",
        help="output JSON file path",
    )
    args = parser.parse_args()

    users = [build_user() for _ in range(args.count)]
    args.out.write_text(json.dumps(users, indent=2))
    print(f"Wrote {len(users)} demo users to {args.out}")


if __name__ == "__main__":
    main()
