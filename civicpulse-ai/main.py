from ai_parser.gemini_parser import parse_need
from tests.test_inputs import TEST_CASES
import json
import time

def run_tests():
    print("=" * 60)
    print("CIVICPULSE — GEMINI PARSER TEST RUN")
    print("=" * 60)

    passed = 0
    failed = 0
    review_flagged = 0

    for case in TEST_CASES:
        print(f"\n[{case['id']}]")
        print(f"Input: {case['report'][:80]}...")

        try:
            result = parse_need(case["report"], case.get("location", "unknown"))
            print(f"Output: {json.dumps(result, indent=2, ensure_ascii=False)}")

            # Basic assertions
            ok = True
            if "expect_category" in case:
                if result.get("category") != case["expect_category"]:
                    print(f"  ❌ Category: expected {case['expect_category']}, got {result.get('category')}")
                    ok = False
            if "expect_urgency_min" in case:
                if result.get("urgency", 0) < case["expect_urgency_min"]:
                    print(f"  ❌ Urgency too low: expected >={case['expect_urgency_min']}, got {result.get('urgency')}")
                    ok = False
            if "expect_confidence_max" in case:
                if result.get("confidence", 1.0) > case["expect_confidence_max"]:
                    print(f"  ❌ Confidence too high for vague input: got {result.get('confidence')}")
                    ok = False

            if result.get("needs_review"):
                review_flagged += 1
                print(f"  🔍 Flagged for human review")

            if ok:
                print(f"  ✅ PASSED")
                passed += 1
            else:
                failed += 1

        except Exception as e:
            print(f"  💥 ERROR: {e}")
            failed += 1
        time.sleep(4)

    print("\n" + "=" * 60)
    print(f"Results: {passed} passed, {failed} failed, {review_flagged} flagged for review")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()