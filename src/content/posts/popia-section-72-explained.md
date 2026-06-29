---
title: "POPIA Section 72 and the default deployment problem"
description: "Most SA enterprises running AI on global cloud vendors are creating a cross-border transfer under Section 72 without knowing it. Here is what the section actually says, and what a compliant architecture looks like."
pubDate: 2026-06-10
draft: false
tags: ["popia", "sovereign-ai", "architecture", "medical-aid"]
---

A South African medical scheme wants to use a large language model to read pre-authorisation requests. The team picks a familiar API, wires it into the claims system, and ships a pilot. The model is good. The latency is fine. The demo lands well with the executive committee.

Somewhere in that pipeline, member health data left the country. Nobody decided that on purpose. It happened because the default path for using AI today routes personal information to infrastructure controlled from outside South Africa, and the default path was never checked against POPIA Section 72.

This is not a hypothetical future risk. It is a current architectural gap, and it sits inside pilots that are already in production.

## What Section 72 actually says

POPIA Section 72 governs the transfer of personal information outside the Republic. The rule is simple to state: you may not send personal information to a third party in a foreign country unless one of five conditions is met.

In short, the transfer is permitted only if:

1. The recipient is bound by a law, binding corporate rules, or a binding agreement that provides an adequate level of protection comparable to POPIA.
2. The data subject consents to the transfer.
3. The transfer is necessary to perform a contract between the data subject and the responsible party.
4. The transfer is necessary for a contract concluded in the interest of the data subject.
5. The transfer is for the benefit of the data subject, and getting consent is not reasonably practical, but they would likely consent if it were.

For a routine AI inference call, condition one is the only realistic basis, and it carries work. Someone has to establish that the foreign provider is bound by adequate protection, document it, and stand behind it if a regulator asks. Most teams running AI pilots have not done that work. They have not done it because the question never came up. The model call looked like any other API call.

## Why "Azure South Africa North" does not solve it

The common reaction is to point at a local region. "We use Azure South Africa North, so the data stays in the country." That answers a different question.

A regional data centre addresses **residency**: where the bytes sit at rest. Section 72 is concerned with **transfer and control**: whether personal information moves to, or becomes accessible from, a party in a foreign jurisdiction. A managed AI service operated by a foreign company can keep storage in a local region while the operator remains subject to foreign law, foreign legal process, and foreign access. Residency is necessary. It is not sufficient.

The distinction that matters is sovereignty, not geography. Sovereignty is about who can compel access to the data and under whose law, not about the postal address of the disk.

## What a compliant sovereign architecture looks like

There is no single answer, but there are three deployment patterns that hold up, in rough order of control.

**On-premises or owned hardware.** The model runs on infrastructure the enterprise controls, inside its own network. Nothing leaves. This gives the strongest Section 72 position because there is no cross-border transfer to justify. It carries the most operational weight: GPU capacity, serving infrastructure, and the team to run it.

**Sovereign cloud.** The model runs on infrastructure operated under South African control and South African law. Cassava AI Factory gave the country credible sovereign GPU compute at scale, which changed what is practical here. The enterprise gets cloud economics without the cross-border transfer.

**Hybrid retrieval with controlled generation.** Sensitive data stays in a sovereign store. Retrieval and generation are designed so that personal information is never the thing sent to an external model: prompts are constructed from de-identified or non-personal context, and any component that touches personal information runs sovereign. This is the most architecturally involved pattern, and the easiest to get subtly wrong.

Each of these is defensible. Each can be documented for a legal team and a regulator. The default API call cannot, until the Section 72 work is done.

## The decision most frameworks miss

Published AI governance frameworks tend to map data at rest and data in transit. They classify the database, the vector store, the backups. They stop short of the moment that matters most for an LLM: inference state.

When a model runs, personal information is assembled into a prompt, held in memory, sometimes logged for debugging or evaluation, and sometimes retained by the provider to improve their service. Each of those is a fresh copy or a fresh exposure of personal information, and each happens during the few seconds the model is actually working. A framework that maps storage and ignores inference state has mapped the easy part and missed the live one.

The right question is not only "where is the data stored." It is "where does personal information travel, and who can reach it, in the moment the model produces an answer." Answer that, and the architecture follows. Skip it, and the pilot ships with a Section 72 gap nobody chose.

## Where to start

If you are responsible for AI, data, or risk at a South African medical scheme, bank, or insurer, the first move is not a new tool. It is a map: every AI workload, every point personal information moves through it, and where each of those points sits relative to South African jurisdiction. That map is what makes a sovereign architecture possible to design, and possible to defend.
