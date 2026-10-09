---
title: "Velocity-Based Training"
subtitle: "Hype or Future?"
description: "Bar velocity turns load prescription into a dynamic, objective metric. Explore the biomechanical foundation, mathematical models, neuromuscular evidence, and device accuracy."
pubDate: 2026-10-11
tags: ["sports-science", "biomechanics", "velocity-based-training", "telemetry"]
draft: false
animation: viking-snatch
---

## The Foundation

Velocity-Based Training (VBT) is grounded in the methodology of performing every concentric repetition with maximal intentional speed. Central to this is the near-linear inverse relationship between the maximal velocity achievable on a lift and its relative load expressed as a percentage of the one-repetition maximum ($1\text{RM}$) [[1]](#ref-1).

<figure class="math-panel chart">
  <div class="math-label">Load–velocity curve (bench press)</div>
  <svg viewBox="0 0 640 400" role="img" aria-label="Mean propulsive velocity falls from about 1.6 m/s at 15% 1RM to about 0.15 m/s at 100% 1RM in the bench press">
    <g class="chart__grid">
      <line x1="60" y1="40" x2="600" y2="40" /><line x1="60" y1="115" x2="600" y2="115" /><line x1="60" y1="190" x2="600" y2="190" /><line x1="60" y1="265" x2="600" y2="265" />
    </g>
    <path class="chart__axis" d="M60 40 V340 H600" />
    <g class="chart__tick" text-anchor="end">
      <text x="50" y="345">0.0</text><text x="50" y="270">0.5</text><text x="50" y="195">1.0</text><text x="50" y="120">1.5</text><text x="50" y="45">2.0</text>
    </g>
    <g class="chart__tick" text-anchor="middle">
      <text x="120" y="362">20</text><text x="240" y="362">40</text><text x="360" y="362">60</text><text x="480" y="362">80</text><text x="600" y="362">100</text>
    </g>
    <path class="chart__curve" d="M90.0 101.5 L105.0 108.8 L120.0 116.1 L135.0 123.2 L150.0 130.3 L165.0 137.4 L180.0 144.4 L195.0 151.3 L210.0 158.2 L225.0 165.1 L240.0 171.8 L255.0 178.6 L270.0 185.2 L285.0 191.8 L300.0 198.4 L315.0 204.9 L330.0 211.3 L345.0 217.7 L360.0 224.1 L375.0 230.3 L390.0 236.5 L405.0 242.7 L420.0 248.8 L435.0 254.8 L450.0 260.8 L465.0 266.8 L480.0 272.7 L495.0 278.5 L510.0 284.2 L525.0 289.9 L540.0 295.6 L555.0 301.2 L570.0 306.7 L585.0 312.2 L600.0 317.6" />
    <text class="chart__label" x="330" y="392" text-anchor="middle">Load (%1RM)</text>
    <text class="chart__label" x="18" y="190" text-anchor="middle" transform="rotate(-90 18 190)">MPV (m·s⁻¹)</text>
  </svg>
</figure>

As intensity increases, peak and mean velocity decrease predictably &mdash; a relationship stable enough to work backwards from. By recording the velocity of a single repetition at a known load, you can estimate an athlete's current one-repetition maximum without ever lifting to failure [[1]](#ref-1).

In the bench press, the relationship between Mean Propulsive Velocity ($\text{MPV}$) and relative intensity ($\text{Load}$ as $\%1\text{RM}$) is governed by the second-order polynomial regression:

<div class="math-panel">
<div class="math-label">Load–velocity relationship (bench press)</div>

$$
\text{MPV}_{(\text{m}\cdot\text{s}^{-1})} = 0.00003 \cdot \text{Load}^2 - 0.0204 \cdot \text{Load} + 1.889
$$

<div class="math-caption"><span><strong>MPV</strong> &mdash; Mean Propulsive Velocity (m·s⁻¹)</span><span><strong>Load</strong> &mdash; percentage of one repetition maximum (%1RM)</span></div>

</div>

Solving this quadratic model for $\text{Load}$ allows the instantaneous calculation of the athlete's current training intensity from a single measured repetition:

<div class="math-panel">
<div class="math-label">Load from bar velocity (bench press)</div>

$$
\text{Load}_{(\%1\text{RM})} = \frac{0.0204 - \sqrt{0.0204^2 - 4 \cdot 0.00003 \cdot (1.889 - \text{MPV})}}{2 \cdot 0.00003}
$$

<div class="math-caption"><span><strong>MPV</strong> &mdash; Mean Propulsive Velocity (m·s⁻¹)</span><span><strong>Load</strong> &mdash; percentage of one repetition maximum (%1RM)</span></div>

</div>

The $1\text{RM}$ is by nature a dynamic value, shifting over time through genuine strength progression or simple daily variation in readiness. This is precisely what makes velocity-based estimation so valuable. Rather than treating the $1\text{RM}$ as a fixed reference point tested periodically, it can be tracked continuously and adjusted to reflect the athlete's actual capacity on any given day, making load prescription both more accurate and more responsive.

> **Methodological Note on Specificity**  
> Load-velocity profiles differ meaningfully between exercises (e.g., bench press vs. back squat), between the devices and measurement protocols used to capture data, and between individual athletes. This makes exercise-specific and device-specific profiles essential, and individual profiles, built from the athlete's own lifts, clearly more accurate than group equations.

---

## Fatigue Detection

Beyond simple $1\text{RM}$ estimation, the use cases of tracking velocity extend far further. Within a set, as neuromuscular fatigue accumulates with each repetition, the achievable velocity on that lift progressively declines [[2]](#ref-2).

<figure class="math-panel chart">
  <div class="math-label">Intra-set velocity loss</div>
  <svg viewBox="0 0 640 400" role="img" aria-label="Bar velocity falls from 0.80 m/s on the first repetition; the set stops at repetition 7, the first one below the 20% velocity loss threshold of 0.64 m/s">
    <g class="chart__grid">
      <line x1="60" y1="60" x2="600" y2="60" /><line x1="60" y1="116" x2="600" y2="116" /><line x1="60" y1="172" x2="600" y2="172" /><line x1="60" y1="228" x2="600" y2="228" /><line x1="60" y1="284" x2="600" y2="284" />
    </g>
    <g class="chart__bar">
      <rect x="78.6" y="116.0" width="40" height="224.0" /><rect x="155.7" y="127.2" width="40" height="212.8" /><rect x="232.9" y="138.4" width="40" height="201.6" /><rect x="310.0" y="155.2" width="40" height="184.8" /><rect x="387.1" y="172.0" width="40" height="168.0" /><rect x="464.3" y="188.8" width="40" height="151.2" />
    </g>
    <rect class="chart__bar chart__bar--stop" x="541.4" y="216.8" width="40" height="123.2" />
    <line class="chart__threshold" x1="60" y1="205.6" x2="600" y2="205.6" />
    <line class="chart__threshold" x1="360" y1="30" x2="398" y2="30" />
    <text class="chart__note" x="600" y="35" text-anchor="end">20% velocity loss · 0.64 m/s</text>
    <path class="chart__axis" d="M60 60 V340 H600" />
    <g class="chart__tick" text-anchor="end">
      <text x="50" y="345">0.4</text><text x="50" y="289">0.5</text><text x="50" y="233">0.6</text><text x="50" y="177">0.7</text><text x="50" y="121">0.8</text><text x="50" y="65">0.9</text>
    </g>
    <g class="chart__tick" text-anchor="middle">
      <text x="98.6" y="362">1</text><text x="175.7" y="362">2</text><text x="252.9" y="362">3</text><text x="330.0" y="362">4</text><text x="407.1" y="362">5</text><text x="484.3" y="362">6</text><text x="561.4" y="362">7</text>
    </g>
    <text class="chart__label" x="330" y="392" text-anchor="middle">Repetition</text>
    <text class="chart__label" x="18" y="200" text-anchor="middle" transform="rotate(-90 18 200)">Velocity (m·s⁻¹)</text>
  </svg>
</figure>

Traditionally, proximity to muscular failure has been expressed through Reps in Reserve (RIR), the athlete's subjective estimate of how many more repetitions could have been completed before failure. The concept is intuitive, but its reliability is inherently limited. Research consistently shows that athletes dramatically underestimate proximity to muscular failure, especially when far away from it. Reps in Reserve is a perception, and perception drifts [[3]](#ref-3).

Velocity loss cuts through that subjectivity entirely. By comparing the velocity of each repetition against the first and freshest rep of the set, you get a continuous objective readout of cumulative fatigue [[2]](#ref-2):

<div class="math-panel">
<div class="math-label">Velocity loss</div>

$$
\text{Velocity loss}\ (\%) = \frac{v_{\text{initial}} - v_{\text{current}}}{v_{\text{initial}}}
$$

<div class="math-caption"><span><strong>v<sub>initial</sub></strong> &mdash; velocity of the first repetition (m·s⁻¹)</span><span><strong>v<sub>current</sub></strong> &mdash; velocity of the current repetition (m·s⁻¹)</span></div>
</div>

Beyond that, real-time velocity tracking allows the athlete to terminate the set at a precisely defined velocity loss threshold. To illustrate, consider an athlete training with a $20\%$ velocity loss threshold. If their first repetition is recorded at $0.80\text{ m/s}$, the set is stopped the moment velocity drops to $0.64\text{ m/s}$, regardless of how the athlete feels:

<div class="math-panel">
<div class="math-label">Velocity cutoff</div>

$$
\begin{aligned}
v_{\text{cutoff}} &= v_{\text{initial}} \times (100\% - \text{velocity threshold}) \\
v_{\text{cutoff}} &= 0.80\text{ m/s} \times (100\% - 20\%) = 0.64\text{ m/s}
\end{aligned}
$$

<div class="math-caption"><span><strong>v<sub>cutoff</sub></strong> &mdash; velocity at which the set is stopped (m·s⁻¹)</span><span><strong>Velocity threshold</strong> &mdash; permitted velocity loss (%)</span></div>
</div>

---

## Scientific Justification

Research on velocity-based training is growing quickly, and the picture it paints is promising but nuanced.

A meta-analysis by Orange et al. found only trivial differences in strength, power, and sprint speed between velocity-based and percentage-based training [[6]](#ref-6). At first glance this looks damning. However, the included studies largely tested velocity-guided load prescription, a narrow use that misses the method's main lever: regulating fatigue through velocity loss thresholds.

That lever matters. Pareja-Blanco et al. had two groups squat at identical relative loads, stopping each set at either $20\%$ or $40\%$ velocity loss [[4]](#ref-4). Despite performing $40\%$ fewer repetitions, the $20\%$ group gained as much strength and significantly more countermovement jump height. The $40\%$ group gained more muscle size but lost myosin heavy chain IIX (MHC-IIX), the fastest and most powerful fiber type, which the $20\%$ group preserved entirely. In professional football players, the performance results held: a $15\%$ threshold outperformed $30\%$ in strength and jumping, although the $30\%$ group performed $65\%$ more repetitions [[5]](#ref-5).

The broadest synthesis, by Jukic et al. ($37$ studies, $735$ participants), confirms the pattern [[9]](#ref-9). Strength gains were similar across thresholds, slightly favoring low to moderate ones. Hypertrophy increased with velocity loss, mostly through the added volume. For jumping, sprinting, and velocity against submaximal loads, the relationship was inverse: the more velocity loss, the smaller the gains.

The takeaway: when speed and explosiveness need to be built or preserved, avoid high intra-set fatigue. Velocity loss thresholds make that fatigue measurable and controllable in real time, which traditional methods can't do.

---

## Application Potential

Translating the theoretical foundations of velocity-based training into practice reveals three concrete applications for strength and conditioning:

- **Load Prescription:** By performing a single repetition against a submaximal load at the start of each session, the athlete's current one repetition maximum can be estimated and the training load adjusted accordingly. This ensures prescription reflects actual capacity on that day rather than a value that may be weeks out of date.
- **Monitoring:** By tracking velocity during both the daily load prescription and the working sets over time, practitioners gain a continuous and objective diagnostic tool. Reductions in velocity may indicate accumulated fatigue or overreaching, while increases reflect genuine strength adaptation.
- **Fatigue Management:** Velocity loss thresholds can be strategically adjusted across the training week and throughout the season to control fatigue accumulation. Larger thresholds ($30\%$) are applied during high load training days to drive greater physiological and structural adaptations. Smaller thresholds ($10\%$) are preserved during tapering sessions, closer to competition, to minimise neuromuscular fatigue while maintaining power output and performance.

The overarching value of this approach lies in its objectivity and can be further improved by individualisation. When velocity data is interpreted in the context of an athlete's own historical values and a personalised load-velocity profile, prescription becomes both more precise and more responsive, reducing the guesswork that inevitably accompanies traditional methods [[7]](#ref-7).

---

## Modality Evaluation

The practical utility of velocity-based training depends entirely on the accuracy of the device used to capture it. Across four commercially available categories, the evidence reveals meaningful differences that directly determine how each can be applied.

<div class="modalities">
  <figure class="modality"><img src="/images/articles/velocity-based-training/modality-linear-transducer.webp" alt="Linear position transducer tethered to a barbell" width="204" height="204" loading="lazy" /><figcaption>Linear Transducers</figcaption></figure>
  <figure class="modality"><img src="/images/articles/velocity-based-training/modality-accelerometer.webp" alt="Accelerometer clipped to the end of a barbell" width="204" height="204" loading="lazy" /><figcaption>Accelerometers</figcaption></figure>
  <figure class="modality"><img src="/images/articles/velocity-based-training/modality-optic-laser.webp" alt="Optic laser velocity device" width="204" height="204" loading="lazy" /><figcaption>Optic Laser Devices</figcaption></figure>
  <figure class="modality"><img src="/images/articles/velocity-based-training/modality-smartphone.webp" alt="Smartphone on a tripod filming a lift" width="204" height="204" loading="lazy" /><figcaption>Smartphone Applications</figcaption></figure>
</div>

- **Linear Transducers:** Linear position transducers (e.g. GymAware, Speed4Lifts) represent the current gold standard, consistently demonstrating the highest accuracy and reproducibility across the available literature. They are appropriate for all core VBT applications, including load prescription, longitudinal monitoring, and precise fatigue regulation through velocity loss thresholds.
- **Accelerometers:** Wearable accelerometer devices offer portability and lower cost, but their accuracy is consistently questionable, with measurement error increasing substantially at higher intensities. Their use is best confined to motivational feedback during high-velocity exercises rather than any application requiring precise velocity measurement.
- **Optic Laser Devices:** Optic laser devices represent a promising and cost-effective intermediate, demonstrating acceptable validity across a broad range of loads in commonly used exercises. They offer a credible alternative to linear transducers for most practical applications, though research across a wider range of exercises remains limited.
- **Smartphone Applications:** Smartphone computer-vision and high-speed camera applications offer the lowest barrier to entry and can show reasonable validity when a single operator uses the same device consistently. However, substantial error emerges when devices or operators change, limiting their use in team settings and high-precision applications.

The choice of device is not a peripheral consideration but a foundational one. The more precise and consequential the application, the greater the demand on device accuracy, and practitioners should select technology that matches the rigour of the training decisions being made from it [[8]](#ref-8).

---

## Conclusion

Velocity-based training is not a tool for every context. Its value rests on a single non-negotiable condition: every repetition must be performed with maximal intentional speed, which makes it most naturally suited to athletes for whom explosive output is not a training cue but a competitive reality. When that condition is met, it delivers a genuine upgrade to how load is prescribed, fatigue is managed, and adaptation is monitored.

So is it hype or is it the future? The honest answer is both, depending entirely on how it is implemented. The science underlying load-velocity profiling and fatigue regulation is compelling, but outcome evidence remains cautious and the field is still maturing. What separates meaningful application from expensive guesswork is the accuracy of the device in use. The less precise the measurement, the more carefully results must be interpreted, favouring trend analysis over individual data points. Practical adjustments such as averaging the first two repetitions of a set can furthermore help reduce the influence of measurement error on velocity loss calculations.

When adopted thoughtfully with technology matched to the demands of the application, individualised profiling per exercise and athlete, and an honest read of what the current evidence does and does not support, velocity-based training offers something traditional methods cannot: a continuous, objective, and honest picture of what the athlete is actually capable of on any given day.

---

## References

<ol class="references-list">
  <li id="ref-1">
    <strong>González-Badillo JJ, Sánchez-Medina L.</strong> Movement velocity as a measure of loading intensity in resistance training. <em>Int J Sports Med</em>. 2010;31(5):347-352.
  </li>
  <li id="ref-2">
    <strong>Sánchez-Medina L, González-Badillo JJ.</strong> Velocity loss as an indicator of neuromuscular fatigue during resistance training. <em>Med Sci Sports Exerc</em>. 2011;43(9):1725-1734.
  </li>
  <li id="ref-3">
    <strong>Halperin I, Malleron T, Har-Nir I, Androulakis-Korakakis P, Wolf M, Fisher J, Steele J.</strong> Accuracy in predicting repetitions to task failure in resistance exercise: a scoping review and exploratory meta-analysis. <em>Sports Med</em>. 2022;52(2):377–390.
  </li>
  <li id="ref-4">
    <strong>Pareja-Blanco F, Rodríguez-Rosell D, Sánchez-Medina L, Sanchis-Moysi J, Dorado C, Mora-Custodio R, et al.</strong> Effects of velocity loss during resistance training on athletic performance, strength gains and muscle adaptations. <em>Scand J Med Sci Sports</em>. 2017;27(7):724-735.
  </li>
  <li id="ref-5">
    <strong>Pareja-Blanco F, Sánchez-Medina L, Suárez-Arrones L, González-Badillo JJ.</strong> Effects of velocity loss during resistance training on performance in professional soccer players. <em>Int J Sports Physiol Perform</em>. 2017;12(4):512–519.
  </li>
  <li id="ref-6">
    <strong>Orange ST, Hritz A, Pearson L, Jeffries O, Jones TW, Steele J.</strong> Comparison of the effects of velocity-based vs. traditional resistance training methods on adaptations in strength, power, and sprint speed: a systematic review, meta-analysis, and quality of evidence appraisal. <em>J Sports Sci</em>. 2022;40(11):1220–1234.
  </li>
  <li id="ref-7">
    <strong>Weakley J, Mann B, Banyard H, McLaren S, Scott T, Garcia-Ramos A.</strong> Velocity-based training: from theory to application. <em>Strength Cond J</em>. 2021;43(2):31–49.
  </li>
  <li id="ref-8">
    <strong>Weakley J, Morrison M, García-Ramos A, Johnston R, James L, Cole MH.</strong> The validity and reliability of commercially available resistance training monitoring devices: a systematic review. <em>Sports Med</em>. 2021;51(3):443–502.
  </li>
  <li id="ref-9">
    <strong>Jukic I, Castilla AP, Ramos AG, Van Hooren B, McGuigan MR, Helms ER.</strong> The acute and chronic effects of implementing velocity loss thresholds during resistance training: a systematic review, meta-analysis, and critical evaluation of the literature. <em>Sports Med</em>. 2023;53(1):177–214.
  </li>
</ol>
