# Step 0 report

- 語彙プール: 11010 語（NGSL + NAWL + AWL + wordfreq Zipf≥3.5 の基本形 + カタカナ語リスト）
- 出題可能な詞条: **4751**（N 4559 / S 132 / K 60）
- 英国発音（Britfone）でも確認済み: 4619 / 4619
- CMU に複数あったが Britfone と一致したので採用: 40
- 音節分割 split が作れた詞条: 3375 / 4751
- 例句が入っている S 詞条: 132 / 132

## 音節数 × 強勢位置

- 2音節: 第1=1898, 第2=593
- 3音節: 第1=777, 第2=588, 第3=43
- 4音節: 第1=96, 第2=308, 第3=228, 第4=2
- 5音節: 第1=4, 第2=27, 第3=97, 第4=64
- 6音節: 第3=3, 第4=17, 第5=5
- 7音節: 第5=1

## タグ別の語数

- 2音節（名詞・形容詞）: 1782
- 3音節: 943
- 2音節（動詞）: 410
- -tion/-sion: 380
- 4音節以上: 372
- -ic/-ical: 168
- 名前動後: 132
- -ity/-ety: 106
- -ate: 92
- カタカナ語: 80
- -ial/-ual: 67
- 名動同形・不変: 60
- 語尾に強勢: 36
- -graphy/-logy/-nomy/-metry: 34
- -ious/-eous/-uous: 30
- -ize/-ise: 29
- -ient/-ience/-iency: 22
- -ish（動詞）: 16
- 規則の例外: 15
- -ian/-cian: 15
- -iar/-ior: 12
- -ular: 12
- -ify: 12
- -tude: 6
- -graph/-crat: 4
- -meter: 3

## 常考词チェックリスト（S 類）

- ✅ record: noun 第1 / verb 第2
- ✅ present: noun 第1 / verb 第2
- ✅ object: noun 第1 / verb 第2 — g2p_en の品詞順を名前動後で補正
- ✅ increase: noun 第1 / verb 第2
- ✅ decrease: noun 第1 / verb 第2
- ✅ conduct: noun 第1 / verb 第2
- ✅ contrast: noun 第1 / verb 第2
- ✅ permit: noun 第1 / verb 第2
- ✅ produce: noun 第1 / verb 第2
- ✅ progress: noun 第1 / verb 第2
- ✅ project: noun 第1 / verb 第2
- ✅ protest: noun 第1 / verb 第2
- ✅ subject: noun 第1 / verb 第2
- ✅ suspect: noun 第1 / verb 第2
- ✅ export: noun 第1 / verb 第2
- ✅ import: noun 第1 / verb 第2
- ✅ insult: noun 第1 / verb 第2
- ✅ desert: noun 第1 / verb 第2
- ✅ rebel: noun 第1 / verb 第2 — g2p_en の品詞順を名前動後で補正
- ✅ refund: noun 第1 / verb 第2

## S 類 通過 66 / 候補 97

| 語 | 名詞/形容詞 | 動詞 | 判定 | 理由 |
|---|---|---|---|---|
| abstract | noun 第1 | 第2 | ✅ |  |
| accent | noun 第1 | 第2 | ✅ |  |
| addict | noun 第1 | 第2 | ❌ | Britfone に無い |
| affect | noun 第1 | 第2 | ❌ | Britfone の強勢 [2] が一致しない |
| allies | noun 第1 | 第2 | ❌ | WordNet で品詞を確認できない |
| alloy | noun 第1 | 第2 | ✅ |  |
| ally | noun 第1 | 第2 | ✅ |  |
| alternate | adj 第2 | 第1 | ❌ | Britfone の強勢 [1] が一致しない |
| annex | noun 第1 | 第2 | ✅ |  |
| attribute | noun 第1 | 第2 | ✅ |  |
| collect | adj 第1 | 第2 | ❌ | Britfone の強勢 [2] が一致しない |
| combat | noun 第1 | 第2 | ✅ |  |
| combine | noun 第1 | 第2 | ✅ |  |
| compact | noun 第1 | 第2 | ✅ |  |
| compound | noun 第1 | 第2 | ✅ |  |
| concert | noun 第1 | 第2 | ✅ |  |
| conduct | noun 第1 | 第2 | ✅ |  |
| confines | noun 第1 | 第2 | ❌ | WordNet で品詞を確認できない |
| conflict | noun 第1 | 第2 | ✅ |  |
| console | noun 第1 | 第2 | ✅ |  |
| construct | noun 第1 | 第2 | ✅ |  |
| contents | noun 第1 | 第2 | ❌ | WordNet で品詞を確認できない |
| contest | noun 第1 | 第2 | ✅ |  |
| contract | noun 第1 | 第2 | ✅ |  |
| contrast | noun 第1 | 第2 | ✅ |  |
| converse | adj 第1 | 第2 | ❌ | Britfone に無い |
| convert | noun 第1 | 第2 | ✅ |  |
| convict | noun 第1 | 第2 | ✅ |  |
| decrease | noun 第1 | 第2 | ✅ |  |
| defect | noun 第1 | 第2 | ✅ |  |
| desert | noun 第1 | 第2 | ✅ |  |
| deserts | noun 第1 | 第2 | ❌ | Britfone に無い; WordNet で品詞を確認できない |
| dictate | noun 第1 | 第2 | ❌ | Britfone の強勢 [2] が一致しない |
| digest | noun 第1 | 第2 | ✅ |  |
| discharge | noun 第1 | 第2 | ✅ |  |
| discount | noun 第1 | 第2 | ✅ |  |
| discourse | noun 第1 | 第2 | ❌ | Britfone の強勢 [1] が一致しない |
| entrance | noun 第1 | 第2 | ❌ | Britfone の強勢 [1] が一致しない |
| envelope | noun 第1 | 第2 | ❌ | Britfone の強勢 [1] が一致しない; WordNet で品詞を確認できない |
| escort | noun 第1 | 第2 | ✅ |  |
| essay | noun 第1 | 第2 | ✅ |  |
| excess | noun 第1 | 第2 | ❌ | WordNet で品詞を確認できない |
| exploit | noun 第1 | 第2 | ✅ | g2p_en の品詞順を名前動後で補正 |
| export | noun 第1 | 第2 | ✅ |  |
| extract | noun 第1 | 第2 | ✅ |  |
| fragment | noun 第2 | 第1 | ❌ | Britfone の強勢 [1] が一致しない |
| impact | noun 第1 | 第2 | ✅ |  |
| import | noun 第1 | 第2 | ✅ |  |
| impress | noun 第1 | 第2 | ❌ | Britfone の強勢 [2] が一致しない |
| incline | noun 第1 | 第2 | ❌ | Britfone の強勢 [2] が一致しない |
| increase | noun 第1 | 第2 | ✅ |  |
| insert | noun 第1 | 第2 | ✅ |  |
| instinct | noun 第1 | 第2 | ❌ | Britfone の強勢 [1] が一致しない; WordNet で品詞を確認できない |
| insult | noun 第1 | 第2 | ✅ |  |
| intern | noun 第1 | 第2 | ✅ |  |
| invite | noun 第1 | 第2 | ❌ | Britfone の強勢 [2] が一致しない |
| mandate | noun 第2 | 第1 | ❌ | Britfone の強勢 [1] が一致しない |
| misconduct | noun 第3 | 第2 | ❌ | Britfone に無い |
| object | noun 第1 | 第2 | ✅ | g2p_en の品詞順を名前動後で補正 |
| overhaul | noun 第1 | 第3 | ❌ | Britfone に無い |
| overlap | noun 第1 | 第3 | ✅ |  |
| perfect | adj 第1 | 第2 | ✅ |  |
| perfume | noun 第1 | 第2 | ✅ |  |
| permit | noun 第1 | 第2 | ✅ |  |
| present | noun 第1 | 第2 | ✅ |  |
| proceeds | noun 第1 | 第2 | ❌ | Britfone の強勢 [2] が一致しない; WordNet で品詞を確認できない |
| process | noun 第1 | 第2 | ❌ | Britfone の強勢 [1] が一致しない |
| processing | noun 第1 | 第2 | ❌ | Britfone の強勢 [1] が一致しない; WordNet で品詞を確認できない |
| produce | noun 第1 | 第2 | ✅ |  |
| progress | noun 第1 | 第2 | ✅ |  |
| project | noun 第1 | 第2 | ✅ |  |
| prospect | noun 第1 | 第2 | ❌ | Britfone の強勢 [1] が一致しない |
| protest | noun 第1 | 第2 | ✅ |  |
| rebel | noun 第1 | 第2 | ✅ | g2p_en の品詞順を名前動後で補正 |
| rebound | noun 第1 | 第2 | ✅ |  |
| recall | noun 第1 | 第2 | ✅ |  |
| record | noun 第1 | 第2 | ✅ |  |
| refresh | None 第1 | 第2 | ❌ | Britfone の強勢 [2] が一致しない; WordNet で品詞を確認できない |
| refund | noun 第1 | 第2 | ✅ |  |
| refuse | noun 第1 | 第2 | ✅ |  |
| reject | noun 第1 | 第2 | ✅ |  |
| relay | noun 第1 | 第2 | ✅ |  |
| remake | noun 第1 | 第2 | ❌ | Britfone に無い |
| replay | noun 第1 | 第2 | ❌ | Britfone に無い |
| resume | noun 第1 | 第2 | ❌ | 品詞で音節数が違う（別の語） |
| rewrite | noun 第1 | 第2 | ✅ |  |
| segment | noun 第1 | 第2 | ✅ | g2p_en の品詞順を名前動後で補正 |
| subject | noun 第1 | 第2 | ✅ |  |
| survey | noun 第1 | 第2 | ✅ |  |
| suspect | noun 第1 | 第2 | ✅ |  |
| transfer | noun 第1 | 第2 | ✅ |  |
| transplant | noun 第1 | 第2 | ✅ |  |
| transport | noun 第1 | 第2 | ✅ |  |
| undertaking | noun 第1 | 第3 | ❌ | Britfone の強勢 [1] が一致しない; WordNet で品詞を確認できない |
| upgrade | noun 第1 | 第2 | ✅ |  |
| uplift | noun 第1 | 第2 | ✅ |  |
| upset | noun 第1 | 第2 | ✅ |  |

## K 類（60 語、候補 82）

advance, affect, amount, approach, attack, attempt, campaign, career, concern, control, debate, demand, design, effect, police, regard, release, report, respect, result, return, review, supply, support, surprise, abuse, appeal, arrest, award, collapse, command, decline, defeat, delay, delight, display, employ, escape, exchange, excuse, mistake, preserve, reform, remark, repair, repeat, reply, request, reserve, resolve, reward, alarm, assist, dispute, divorce, embrace, neglect, recruit, regret, resort

## 規則の例外（自動判定）

- **-ate** (1): karate(2)
- **-ial/-ual** (1): spiritual(1)
- **-ic/-ical** (2): politics(1), rhetoric(1)
- **-ize/-ise** (3): characterize(1), expertise(3), industrialize(2)
- **-meter** (1): millimeter(1)
- **-tion/-sion** (1): subdivision(1)
- **語尾に強勢** (6): coffee(1), committee(2), comrade(1), employee(2), honeymoon(1), refugee(1)

## 除外された語

- **CMU に無い** (602): aa, absorbings, abstractly, acceleratings, accumulatings, acidics, acknowledgemens, adaptives, adjacents, advertisment, advertisments, advertize, advertizing, aeroplane, affirmings, ageing, aggregatings, ain, allocatings, alterable, analyse, analyser, appropriacy, approximatings, architected, architecting, architectings, arrayings, arrowed, arrowing, arrowings, artefact, articulatings, artificials, artistics, assertings, assessable, atomics, auctionings, auditings, authorised, bacterials, baddest, barrelings, barrellings, basined, beamings, behavioural, bitted, blacking, bleedin, boundings, bracketted, bubblings, bulkings, castling, categorisation, categorise, cf, characterisation, characterise, chronics, chunking, ci, circulatings, civilisation, cl, clarifyings, classifyings, clickings, cluings, cm, col, colourful, communicatively, comparables, compensatings, complementings, complyings, componentry, computable, conceivings, conceptualisation, conceptualise, conceptuals, conditionals, confidents, confinings, conformability, conformable, conformation, confoundings, consentings, conserves, conservings, constrainings, contactable, contextualise, contextualised, contextualising, contextualize, contextualized, contextualizing, contourings, contradictings, contrarily, contrastive, controversially, coordinatings, cordings, correlatings, coulda, couldn, councillor, counselling, criticise, critiquings, cueings, cupping, cyclics, dampings, decayings, deceivings, defectings, degradings, demonstratively, deniable, denotation, denotings, deregister, deregistered, deregistering, deregisters, deregistration, developmentals, devotedly, diagramming, dialoged, dialoging, dialogued, dialoguing, dictatings, didn, differenced, differencing, differentiatings, digitals, dilutings, dimensionals, dirtying, disadvantagings, dischargings, discoursings, discretely, disestablish, disproportion, distributional, diversely, dl, dm, doesn, doin, dosings, drainings, dramatisation, dramatise, driftin, ecologicals, elaboratings, elevatings, embeddings, emittings, emphasise, empiricals, erasings, ethicals, evaluative, evidential, evidents, evolutionist, exclusionist, exitings, experimentals, exploitings, externalisation, externalise, externality, externalization, externalize, fa, faceting, facetings, facilitatings, factorial, fandom, fatiguings, favourable, finalise, finnings, flatted, flatting, flavour, fleshings, flippings, fluxings, focusses, focussing, foetal, footballer, footnotings, founds, fracturings, fringings, ft, gagings, gaugings, generalisation, generalise, generalisings, gettin, ghostings, globalisation, graining, grammaticals, graphings, guttings, hadn, hasn, headquarterings, hipped, honours, hows, humoring, hypothesise, ic, identically, identicals, ie, ii, iii, illogically, imaginings, impactings, inappropriacy, inclining, inconceivably, inconstantly, incredibles, indirects, indiscrete, indistinctly, industrialisation, industrialise, industrialisings, infectings, influentials, inhibitings, initiatings, injectings, inners, inputted, inputting, insertings, insignificantly, institutionalise, intenseness, intension, interactings, interactively, interfaced, interfacing, interfacings, interferings, intermediatings, internalise, internals, interpretative, interruptings, intervenings, invadings, invalidity, invertings, islanded, islanding, isn, itemisation, itemise, iv, ix, jazzings, jewellery, journaling, kc, kg, km, legitimatings, leverings, lexicals, liables, liberalisation, liberalise, linears, litre, ll, logicals, longitudinals, lumpings, manipulatings, marginals, maternals, mathematicals, maths, maturational, maximisation, maximise, maximisings, mechanicals, mediatings, memorise, memorisings, mentorings, midfield, mighta, mightn, migratings, minimalisation, minimalise, minimalised, minimalises, minimalising, minimalistic, minimalization, minimalize, minimalized, minimalizes, minimalizing, minimals, minimise, minimisings, ml, moleculars, monkeyings, morphologicals, multidimensional, multiplyings, musta, mustn, necking, nestings, neurals, neurone, neurones, neutralisation, neutralise, nigga, nm, nonlinears, normalisation, normalise, nulled, nulling, nullings, numericals, obscurings, obtainings, offence, opinioned, opticals, optimals, organise, organised, orientate, orientings, oughtn, outers, overviewed, overviewing, overviewings, oxidise, oxidisings, oxidizings, paling, panelling, parcelling, pardonings, parentals, parred, parring, parrings, pe, periodics, phenomenals, philosophicals, philosophise, philosophize, philosophizing, phonologicals, photographics, physiologicals, plausibles
- **Britfone に無い（英国発音で確認できない）** (1915): abandonment, abdomen, abnormally, absorbing, abstraction, abused, abusive, academia, academically, accelerated, accenting, accidental, accompaniment, accomplishment, accountable, accumulated, accusing, accustomed, achievable, acquainted, acquiring, activating, activism, adaptability, adaptable, addict, addicted, addictive, adequacy, administrate, administratively, admired, adorable, adrenaline, adulthood, advancing, aesthetics, affective, affectively, affinity, affirmative, affirmed, afghan, aforementioned, aftermath, aggregation, aggressively, aided, airborne, ala, alarming, alcoholic, aligned, alleviate, alphabet, altering, alternating, amazingly, ambush, amelia, amends, ammunition, amused, analytic, analytically, anarchy, ancestry, ancients, angling, angular, anterior, anthem, apartheid, apocalypse, append, appreciable, appreciably, apprentice, approachable, appropriateness, approving, arbitrarily, arbitrariness, archer, aren, argentine, arguably, arming, armored, arranging, arresting, arrogance, arrogant, artillery, aspiring, assassin, assassination, assembling, asserted, assigning, assuredly, astronaut, atheist, atm, attacker, attainable, attained, attendant, attributable, attribution, augmented, authenticity, authoritarian, authoritative, authorship, autobiography, automate, autopsy, avoidance, awaited, awakening, awarding, awhile, baba, backbone, backdrop, backlash, backpack, backstage, backyard, baggage, bagging, bakery, balancing, ballroom, bamboo, bankrupt, banning, barker, barrels, barring, bartender, bathing, baton, battalion, batter, batting, beacon, bedtime, behold, believer, belling, belongings, belting, bending, benedict, beneficiary, benny, betrayal, bilateral, billboard, billionaire, bipolar, birthing, biting, blackout, blasting, blended, blinder, blizzard, blockade, bluing, bohemian, bonding, boogie, booker, booster, bounded, bounty, bourbon, branching, branded, branding, bravery, breaker, breakthrough, breakup, breathtaking, brevity, brewer, brewing, brightness, broadcaster, brotherhood, browning, brushing, brutality, brutally, bullying, bundling, bunker, burger, burgess, burying, cafeteria, calculating, caliber, calif, caller, calming, calorie, campaigning, canton, caption, captive, captivity, cardinal, careless, carpenter, carpeting, cartel, carving, cashier, casing, catcher, categorization, caucus, cavalry, cc, cd, ceaseless, celebrated, celestial, cellphone, censoring, centering, challenger, chamberlain, chandler, chaotic, chapman, charcoal, chartered, cheesy, chemically, cherish, chickened, childish, chili, chilling, chipping, choking, cinematic, cinnamon, circa, circulating, citrus, civilized, clarence, clarification, classy, cleansing, clipping, clocking, cloning, clouding, clubbing, clueless, clustering, coaster, coastline, coca, cockpit, coherence, coherently, coincident, coincidental, cola, collaborate, collapsible, collateral, collectively, collision, colorful, coloring, colouring, columned, columnist, combustion, comeback, comedian, comforting, comforts, commanding, commencement, commercially, commissioned, commissioning, communal, communicable, communicating, commute, compartment, compassion, compassionate, compensated, compensatory, compiling, complicate, compliments, composing, compounding, comprehend, comprehensively, concealed, conceivably, conceptually, concluding, conclusive, conclusively, concurrent, concurrently, concussion, conditioned, conductor, confederate, confirming, conflicting, conformance, conformist, conformity, congestion, congratulate, congressman, congruent, connexion, conquest, consciously, consolation, constancy, constituted, constitutionally, constitutive, consul, consulate, consultative, consuming, contagious, contaminated, contend, contender, contention, contested, contextual, contingent, contracted, convene, conveniently, convening, conventionally, converging, converse, convincingly, cooperatively, coordinating, coping, corporates, correspondingly, corrupt, counselor, countdown, countless, coupling, courageous, coursing, courthouse, courting, courtroom, covert, cozy, crappy, crashing, crater, craving, crawling, creatively, credentials, credible, credited, creeping, crimson, crippled, crossover, crowding, crucially, cruiser, crusade, crushing, culinary, cultivated
- **X: CMU と Britfone で強勢が違う** (83): accountability(US2/UK[4]), aluminium(US2/UK[3]), amateur(US1/UK[1, 3]), anime(US3/UK[1]), applicable(US1/UK[1, 2]), approximation(US4/UK[2]), archaeological(US4/UK[3]), auditorium(US3/UK[1]), ballet(US2/UK[1]), cafe(US2/UK[1]), caffeine(US2/UK[1]), capillary(US1/UK[2]), circulation(US1/UK[3]), coincide(US3/UK[2]), compliment(US1/UK[1, 3]), composite(US2/UK[1]), confine(US2/UK[1, 2]), conserve(US2/UK[1, 2]), contact(US1/UK[1, 2]), contracting(US1/UK[2]), controversy(US1/UK[1, 2]), conversely(US1/UK[1, 2]), debris(US2/UK[1]), default(US2/UK[1, 2]), detailed(US2/UK[1]), diagnose(US3/UK[1]), differentiate(US3/UK[5]), diverse(US2/UK[1, 2]), email(US2/UK[1]), endurance(US1/UK[2]), financing(US2/UK[1, 2]), frequent(US1/UK[1, 2]), frontier(US2/UK[1, 2]), frustrated(US1/UK[2]), frustrating(US1/UK[2]), garage(US2/UK[1]), geographic(US3/UK[2]), geographical(US3/UK[2]), harassment(US2/UK[1, 2]), headquarter(US1/UK[2]), headquarters(US1/UK[2]), hello(US2/UK[1, 2]), ideological(US4/UK[3]), industrialization(US6/UK[5]), innate(US2/UK[1, 2]), integral(US1/UK[1, 2]), interstate(US3/UK[1]), inventory(US3/UK[1]), invert(US2/UK[1, 2]), laboratory(US1/UK[2]), mama(US1/UK[2]), medieval(US2/UK[2, 3]), mediocre(US3/UK[1, 3]), migrate(US1/UK[2]), narrator(US1/UK[2]), omega(US2/UK[1]), outsider(US2/UK[1]), overlook(US1/UK[3]), papa(US1/UK[2]), physiological(US4/UK[3]), plateau(US2/UK[1]), premier(US2/UK[1]), premiere(US2/UK[1]), primarily(US2/UK[1, 2]), realistic(US3/UK[2]), regain(US2/UK[1, 2]), researcher(US1/UK[1, 2]), resource(US1/UK[1, 2]), respiratory(US1/UK[1, 2]), rotate(US1/UK[2]), second(US1/UK[1, 2]), souvenir(US3/UK[1, 3]), spectator(US1/UK[2]), syntactic(US2/UK[1]), television(US1/UK[1, 3]), temporarily(US3/UK[1]), thanksgiving(US2/UK[1]), theoretical(US3/UK[2]), undermine(US1/UK[3]), unite(US1/UK[2]), vaccine(US2/UK[1]), variability(US4/UK[3]), yahoo(US1/UK[1, 2])
- **X: CMU に複数の強勢位置** (49): address(CMU[1, 2]/UK[2]), adult(CMU[1, 2]/UK[1, 2]), adverse(CMU[1, 2]/UK[1, 2]), allied(CMU[1, 2]/UK[1, 2]), allies(CMU[1, 2]/UK[1, 2]), automobile(CMU[1, 4]/UK[4]), complex(CMU[1, 2]/UK[1, 2]), concrete(CMU[1, 2]/UK[1, 2]), confines(CMU[1, 2]/UK[1, 2]), content(CMU[1, 2]/UK[1, 2]), contents(CMU[1, 2]/UK[1, 2]), contrary(CMU[1, 2]/UK[1, 2]), costume(CMU[1, 2]/UK[1]), debut(CMU[1, 2]/UK[1]), decade(CMU[1, 2]/UK[1, 2]), decor(CMU[1, 2]/UK[1]), decreased(CMU[1, 2]/UK[1, 2]), detail(CMU[1, 2]/UK[1]), details(CMU[1, 2]/UK[1]), eighteen(CMU[2]/UK[1, 2]), excerpt(CMU[1, 2]/UK[1, 2]), excess(CMU[1, 2]/UK[1, 2]), extraordinary(CMU[2, 3]/UK[2, 3]), fifteen(CMU[2]/UK[1, 2]), finance(CMU[1, 2]/UK[1, 2]), finances(CMU[1, 2]/UK[1, 2]), forbidden(CMU[1, 2]/UK[2]), formidable(CMU[1, 2]/UK[1, 2]), governmental(CMU[1, 3]/UK[3]), inside(CMU[1, 2]/UK[1, 2]), into(CMU[1, 2]/UK[1, 2]), invalid(CMU[1, 2]/UK[1, 2]), kilometer(CMU[1, 2]/UK[1, 2]), kilometre(CMU[2, 3]/UK[1, 2]), madame(CMU[1, 2]/UK[1, 2]), minute(CMU[1, 2]/UK[1, 2]), offset(CMU[1, 2]/UK[1, 2]), recess(CMU[1, 2]/UK[1, 2]), research(CMU[1, 2]/UK[1, 2]), reset(CMU[1, 2]/UK[1, 2]), resume(CMU[1, 2]/UK[1, 2]), romance(CMU[1, 2]/UK[1, 2]), sixteen(CMU[2]/UK[1, 2]), sometimes(CMU[1, 2]/UK[1, 2]), supplement(CMU[1, 3]/UK[1, 3]), towards(CMU[1, 2]/UK[1, 2]), transform(CMU[1, 2]/UK[1, 2]), update(CMU[1, 2]/UK[1, 2]), upright(CMU[1, 2]/UK[1])
- **X: CMU の第一強勢が0個または複数** (39): alongside(UK[2]), archbishop(UK[1, 2]), baseball(UK[1]), downstairs(UK[1, 2]), downtown(UK[1]), duration(UK[2]), engineer(UK[3]), engineering(UK[3]), everyday(UK[1, 3]), forthcoming(UK[2]), fourteen(UK[1, 2]), halfway(UK[1, 2]), handmade(UK[2]), hardcore(UK[1]), lemonade(UK[3]), lightweight(UK[1]), mankind(UK[2]), nationwide(UK[1]), navigation(UK[3]), nearby(UK[1, 2]), nineteen(UK[1, 2]), nineteenth(UK[2]), offshore(UK[1]), outdoors(UK[1]), outside(UK[1, 2]), overhead(UK[1, 3]), overnight(UK[1, 3]), overseas(UK[1, 3]), relocation(UK[3]), seventeen(UK[1, 3]), shanghai(UK[2]), somewhat(UK[2]), straightforward(UK[2]), thereby(UK[2]), thirteen(UK[1, 2]), upside(UK[1]), widespread(UK[1]), worldwide(UK[1, 2]), worthwhile(UK[2])
- **不適切な語** (60): anal, arse, ass, asshole, bastard, bitch, bullshit, cock, crap, cum, cunt, dick, dong, dumbass, erotic, fart, fuck, fucker, fucking, gal, goddamn, homo, hooker, horny, jerk, meth, moron, motherfucker, nazi, negro, nude, orgasm, pee, penis, piss, pissed, pissing, playboy, poop, porn, pornography, prick, prostitute, pussy, queer, rape, raped, rapist, retarded, screw, scum, shit, shitty, slut, suck, sucking, vagina, weed, whore, woody
- **記号・空白を含む** (25): co-operate, co-ordinate, co‑operated, co‑operates, co‑operation, co‑operative, co‑operatively, co‑ordinated, co‑ordinates, co‑ordinating, co‑ordination, co‑ordinator, co‑ordinators, non-conformist, non-conformists, non-conformity, non-traditional, over‑estimate, re-evaluate, re-evaluated, re-evaluates, re-evaluating, re-evaluation, so‑called, under-resourced
- **活用形（-s/-ed/-ing）** (468): abandoned, absorbed, accepted, accepting, accompanied, accompanying, accomplished, according, accredited, acknowledged, acquired, activated, adapted, addressed, adjusted, adopted, advanced, advertised, advised, affected, affecting, affiliated, agreed, alleged, altered, amazed, amazing, amended, amusing, analyzed, animated, announced, annoyed, annoying, answering, anticipated, appealing, applied, appointed, appreciated, approved, archives, arranged, assigned, assisted, assumed, assuming, assured, astonishing, attached, attacking, attempted, attended, authorized, automated, baking, balanced, beaten, becoming, begging, betting, biased, boiling, bothered, bouncing, broken, browsing, buried, busted, buzzing, calculated, cancelled, catering, centered, certified, challenging, changing, chanting, charming, chewing, coated, collected, coloured, combined, committed, compelling, complaining, completed, completing, complicated, composed, compressed, concentrated, concerned, concluded, confined, confirmed, confused, confusing, connected, considered, consolidated, contained, continued, continuing, contributing, controlled, controlling, converted, convinced, convincing, coordinated, corrected, correlated, corresponding, coupled, covered, crooked, crowded, damaged, damaging, dated, deceased, decided, declared, dedicated, defending, defined, delayed, delighted, demanding, demonstrated, depressed, depressing, derived, descending, described, deserved, designed, desired, destroyed, detached, detected, determined, determining, devastating, developed, devoted, dining, directed, disabled, disappointed, discovered, disgusting, dismissed, distinguished, distracted, distributed, disturbed, disturbing, divided, diving, divorced, documented, dominated, drilling, driven, dropping, dwelling, edited, educated, elected, embarrassed, embarrassing, embedded, emerging, employed, enabling, enclosed, encouraged, encouraging, endangered, ended, engaged, engaging, enhanced, entertaining, entitled, equipped, escaped, established, excited, exciting, executed, exhausted, existing, expanded, expected, experienced, expired, exposed, expressed, extended, faded, fallen, falling, fascinating, fashioned, featured, figured, finished, fired, fitted, focused, forgotten, frightened, frozen, funded, furnished, gambling, gathered, graduated, granted, guided, guiding, handed, handled, hated, headed, healing, heated, hidden, hiking, hired, honored, identified, ignored, impaired, implemented, imported, imposed, impressed, improved, improving, inclined, included, incorporated, increased, increasing, induced, infected, informed, inherited, injured, inspired, integrated, intended, interested, interesting, interpreted, involved, isolated, joking, justified, kidnapping, labeled, labelled, lacking, landed, lasting, laughing, licensed, licking, lifted, listed, loaded, located, loving, lowered, maintained, manufactured, matching, measured, misleading, missing, mistaken, misunderstanding, misunderstood, modified, motivated, mounted, moving, murdered, needed, nominated, noted, noticed, obliged, observed, obsessed, occupied, offended, opened, operating, opposed, ordered, organized, oriented, outlined, overwhelming, owing, painted, participating, paying, perceived, personalized, plumbing, pointed, polished, possessed, posted, pouring, powered, preceding, preferred, prepared, prescribed, preserved, privileged, processed, prohibited, projected, prolonged, promising, pronounced, protected, protecting, proven, published, punished, pursuing, qualified, raining, ranging, realised, realized, received, recognised, recognized, recorded, recovered, recycling, reduced, referenced, refined, reflected, reflecting, registered, regulated, rejected, related, relaxed, relieved, remaining, removed, renewed, repeated, reported, represented, requested, required, reserved, resolved, respected, restricted, retained, retired, returning, revised, risen, roaring, ruined, satisfied, scheduled, scissors, scratching, searching, seated, selected, separated, settled, sewing, shaken, shattered, shocking, shouted, shutting, simplified, situated, skating
- **派生形（基本形と同じ強勢）** (682): abruptly<abrupt, accidentally<accidental, accordingly<according, accounting<account, accurately<accurate, accused<accuse, acting<act, actively<active, actually<actual, additionally<additional, adequately<adequate, admittedly<admitted, advertising<advertise, aging<age, airing<air, allegedly<alleged, alternatively<alternative, annually<annual, apparently<apparent, appearing<appear, approaching<approach, appropriately<appropriate, approximately<approximate, arguing<argue, asking<ask, assembly<assemble, attending<attend, backing<back, badly<bad, banging<bang, banking<bank, barely<bare, bargaining<bargain, bearing<bear, beating<beat, beautifully<beautiful, bedding<bed, beginning<begin, being<be, believing<believe, belly<bey, belonging<belong, bidding<bid, billing<bill, billy<bille, binding<bind, bleeding<bleed, blessing<bless, blocking<block, blowing<blow, boarding<board, boating<boat, bodily<body, bombing<bomb, booking<book, boring<bore, borrowing<borrow, bowling<bowl, boxing<box, breaking<break, breathing<breathe, breeding<breed, bridges<bridge, briefing<brief, briefly<brief, bringing<bring, broadcasting<broadcast, broadly<broad, building<build, bully<buy, burning<burn, butterfly<buttery, buying<buy, calling<call, calmly<calm, camping<camp, carefully<careful, caring<care, casting<cast, casually<casual, catching<catch, causing<cause, certainly<certain, chambers<chamber, channels<channel, cheating<cheat, cheering<cheer, chosen<choose, classified<classify, cleaning<clean, clearing<clear, clearly<clear, climbing<climb, closely<close, closing<close, clothing<clothe, coaching<coach, coating<coat, coding<code, collecting<collect, colored<color, colors<color, colours<colour, comfortably<comfortable, coming<come, commonly<common, comparatively<comparative, comparing<compare, completely<complete, computing<compute, conditioning<condition, conditions<condition, consequently<consequent, considerably<considerable, consistently<consistent, constantly<constant, continually<continual, continuously<continuous, cooking<cook, cooling<cool, copying<copy, correctly<correct, costing<cost, costly<cost, coughing<cough, counseling<counsel, counting<count, covering<cover, cracking<crack, credits<credit, criteria<criterion, critically<critical, crossing<cross, crying<cry, curly<cur, currently<current, cutting<cut, cycling<cycle, daily<dai, damages<damage, dancing<dance, dating<date, deadly<dead, dealing<deal, deciding<decide, deeply<deep, defeated<defeat, defining<define, definitely<definite, deliberately<deliberate, designing<design, desperately<desperate, developing<develop, differently<different, digging<dig, directly<direct, distinctly<distinct, dolly<dolle, drawing<draw, dreaming<dream, dressing<dress, drinking<drink, driving<drive, dyeing<dye, dying<die, early<earle, easily<easy, eating<eat, economically<economical, editing<edit, effectively<effective, effects<effect, efficiently<efficient, elderly<elder, encoding<encode, ending<end, enormously<enormous, entering<enter, entirely<entire, equally<equal, especially<especial, essentially<essential, evening<even, evenly<even, eventually<eventual, evidently<evident, exactly<exact, exceptionally<exceptional, exclusively<exclusive, explicitly<explicit, extensively<extensive, extremely<extreme, facing<face, failing<fail, fairly<fair, farming<farm, feeding<feed, feeling<feel, fighting<fight, filing<file, filling<fill, finally<final, financially<financial, finding<find, finely<fine, fingering<finger, finishing<finish, firing<fire, firmly<firm, firstly<first, fishing<fish, fitting<fit, flashing<flash, floating<float, flooring<floor, flying<fly, focusing<focus, folding<fold, following<follow, formally<formal, formatting<format, formerly<former, fortunately<fortunate, forwarding<forward, framing<frame, frankly<frank, freely<frey, freezing<freeze, frequently<frequent, friendly<friend, frightening<frighten, functioning<function, fundamentally<fundamental, funding<fund, gaming<game, gardening<garden, gathering<gather, generally<general, gently<gentle, genuinely<genuine, getting<get, given<give, giving<give, glasses<glass, going<go, governed<govern, governing<govern, gradually<gradual, greatly<great, greeting<greet, grouping<group, growing<grow, handling<handle, hanging<hang, happening<happen, happily<happy, hardly<hard, heading<head, hearing<hear, heating<heat, heavily<heavy, helping<help, hiding<hide, highly<high, historically<historical, hitting<hit, holding<hold, holly<holle, holy<hy, honestly<honest, hopefully<hopeful, hourly<hour, housing<house, hunting<hunt, hurting<hurt, ideally<ideal, imaging<image, immediately<immediate, importantly<important, incidentally<incidental, increasingly<increasing, incredibly<incredible, indefinitely<indefinite, independently<independent, indirectly<indirect, individually<individual, inevitably<inevitable, initially<initial, instantly<instant, insured<insure, integrating<integrate, interestingly<interesting, internationally<international, invariably<invariable, investigating<investigate, investing<invest, ironically<ironical, ironing<iron, joining<join, jointly<joint, jolly<joy, judges<judge, judging<judge, jumping<jump, keeping<keep, kicking<kick, killing<kill, kindly<kind, kissing<kiss, knocking<knock, knowing<know, landing<land, largely<large, lately<late, laying<lay, leading<lead, leaning<lean, learning<learn, leaving<leave, legally<legal, lending<lend, letters<letter, letting<let, lighting<light, lightly<light, likely<like, lily<li, limited<limit, limiting<limit, lining<line, listening<listen, listing<list, literally<literal, lively<live, living<live, loading<load, locally<local, locking<lock, logging<log, lonely<lone, looking<look, loudly<loud, lovely<love, luckily<lucky, lying<lie, mailing<mail, mainly<main, making<make, manually<manual, manufacturing<manufacture, mapping<map, marching<march, marketing<market, marking<mark, married<marry, masses<mass, masters<master, mating<mate, meaning<mean, measuring<measure, media<medium, meeting<meet, mentally<mental, merely<mere, messaging<message, mining<mine, mixing<mix, modeling<model, modelling<model, molly<moy, monitoring<monitor, monthly<month, mostly<most, mounting<mount, multiply<multiple, namely<name, narrowly<narrow, nationally<national, naturally<natural, nearly<near, newly<ney, nicely<nice, normally<normal, notably<notable, numbers<number, nursing<nurse, obviously<obvious, occasionally<occasional, occasions<occasion, oddly<odd, offering<offer, officially<official, only<oy, opening<open, openly<open, ordering<order, originally<original, outing<out, packaging<package, packing<pack