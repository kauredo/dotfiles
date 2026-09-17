# Neutral phrasing for security findings (Fable/Mythos-tier only)

The Fable safeguards pattern-match on offensive-security vocabulary even in clearly authorized, defensive work (audits of my own code, pentests I asked for, CTF-style exercises). To avoid false-positive flags that interrupt the task, describe vulnerabilities in fix-oriented, neutral terms, especially in subagent/workflow prompts and args, where dense clusters of this language trip the classifier hardest:

- Say "missing authorization check on endpoint X" rather than "endpoint X has zero auth, exposing PHI, lets anyone exfiltrate patient data."
- Say "unscoped tenant lookup" rather than "cross-tenant read by enumeration / break tenant isolation."
- Describe the defect and the fix; skip the attacker-playbook framing ("how to break in," "exfiltrate," "tamper with"). Precision does not require exploit narration.
- Presentation only. Do NOT drop, soften, or downgrade the severity of a real finding. A genuine auth bypass is still P0; report it fully, just in defensive language.
