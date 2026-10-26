---
title: Specification files and trademarks
description: Why this project does not include the S1000D distribution, and how trademarks and licenses are handled.
---

This project does not include the S1000D® specification, XML schemas, default BREX (Business Rules Exchange) or official samples in any repository or package; it reads the files the user has obtained. This page summarises the reasoning behind that decision and how trademarks and licenses are handled.

## Why the distribution is not included

The S1000D distribution (the specification PDF, XML schemas, examples and the other information on the download page) comes with terms of use. The main points, as read from the data module `S1000D-A-00-00-0000-00A-021A-D` at the start of the Issue 7 specification, are as follows. This is a private summary and not a legal judgement.

| Clause | Content | Effect on this project |
| --- | --- | --- |
| License to use | Grants a non-exclusive license to use the specification, produce technical information and provide training, as long as the conditions are observed | Building and providing tools that follow the specification is within the license |
| Special usage rights | Those allowed to reproduce and publish the specification free of charge are limited to 8 categories, such as member companies of ASD, AIA and A4A and the ministries of defence of member nations | Individual developers are not included. There is no permission to redistribute |
| Definitions | The "S1000D suite of information" includes the specification, the examples (XML instances, PDFs and stylesheets), the XML schemas and the other information on the download page | The XSD, samples, default BREX and data dictionary fall under the same conditions |
| Intellectual property rights | All rights not expressly granted are reserved | Redistribution is not granted |
| No modifications | Prohibits modification, adaptation and translation. Adding business rules is allowed | Chapters of the specification are not translated and published. A self-written BREX counts as "adding business rules" |

For these reasons, the project handles the files as follows.

- The npm packages and repositories contain only self-written code and self-made data.
- The MCP servers take the distribution the user has obtained through the `S1000D_SPEC_DIR` environment variable.
- Tests run on self-made data modules and a self-written BREX. Tests that use the distribution run only in the user's environment.
- This site does not rewrite chapters of the specification into another language; it explains the concepts in its own words and its own structure. Element and attribute names (`dmCode`, `objectPath` and so on) are used as they are.

:::note[Examples of the same decision]
The Python S1000D MCP server `i2oss/s1000d-mcp` uses a self-made subset XSD because "the official XSD cannot be redistributed", and the S1000D framework for Oxygen XML does not include the schemas and has the user obtain them.
:::

## Trademarks

S1000D™ is a trademark of ASD (Aerospace, Security and Defence Industries Association of Europe), and S1000D® is a trademark registered in the EU. This is a personal project and is not affiliated with ASD; it is neither endorsed by nor partnered with ASD. The package and repository names contain `s1000d` to show that what they handle (BREX, DMCs, data modules) are S1000D concepts. The project keeps to the following 3 points.

1. Stay in its own namespace (`@shuji-bonji/s1000d-…`, `shuji-bonji/s1000d-…`)
2. State in the README and the package description that the project is not affiliated with ASD and that S1000D® is a registered trademark of ASD
3. Use no wording or logos that could be taken as "official" or "certified"

## Licenses

| Subject | License |
| --- | --- |
| Code (s1000d-core, each MCP server, products, scripts) | MIT |
| The text of this site | CC BY 4.0 |
| Self-made sample data (the ticket machine example and others) | MIT |

## References

- [S1000D official site](https://s1000d.org/) / [Terms of Use](https://s1000d.org/?page_id=108)
- [S1000D Framework License Agreement (Oxygen XML)](https://www.oxygenxml.com/addons/oxygenxml.s1000d.framework_license.html)
