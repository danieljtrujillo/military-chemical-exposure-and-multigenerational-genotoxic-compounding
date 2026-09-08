// ==================== SPACE STARFIELD BACKGROUND ====================
(function(){
var PARTICLE_NUM = 500;
var PARTICLE_BASE_RADIUS = 0.5;
var FL = 500;
var DEFAULT_SPEED = 2;
var BOOST_SPEED = 300;

var canvas;
var canvasWidth, canvasHeight;
var context;
var centerX, centerY;
var mouseX, mouseY;
var speed = DEFAULT_SPEED;
var targetSpeed = DEFAULT_SPEED;
var particles = [];

function Particle(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.pastZ = 0;
}

function randomizeParticle(p) {
    p.x = Math.random() * canvasWidth;
    p.y = Math.random() * canvasHeight;
    p.z = Math.random() * 1500 + 500;
    return p;
}

function loop() {
    context.save();
    context.fillStyle = 'rgba(4, 2, 16, 0.85)';
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.restore();

    speed += (targetSpeed - speed) * 0.01;

    var p, cx, cy, rx, ry, f, x, y, r, pf, px, py, pr, a, a1, a2;
    var halfPi = Math.PI * 0.5;
    var atan2 = Math.atan2, cos = Math.cos, sin = Math.sin;

    context.beginPath();
    context.fillStyle = 'rgb(255, 255, 255)';
    for (var i = 0; i < PARTICLE_NUM; i++) {
        p = particles[i];
        p.pastZ = p.z;
        p.z -= speed;
        if (p.z <= 0) { randomizeParticle(p); continue; }

        cx = centerX - (mouseX - centerX) * 1.25;
        cy = centerY - (mouseY - centerY) * 1.25;
        rx = p.x - cx;
        ry = p.y - cy;

        f = FL / p.z;
        x = cx + rx * f;
        y = cy + ry * f;
        r = PARTICLE_BASE_RADIUS * f;

        pf = FL / p.pastZ;
        px = cx + rx * pf;
        py = cy + ry * pf;
        pr = PARTICLE_BASE_RADIUS * pf;

        a = atan2(py - y, px - x);
        a1 = a + halfPi;
        a2 = a - halfPi;

        context.moveTo(px + pr * cos(a1), py + pr * sin(a1));
        context.arc(px, py, pr, a1, a2, true);
        context.lineTo(x + r * cos(a2), y + r * sin(a2));
        context.arc(x, y, r, a2, a1, true);
        context.closePath();
    }
    context.fill();
}

canvas = document.getElementById('c');
var resize = function() {
    // Draw at device resolution, capped at 2x. Without this the particles are
    // soft on every high-DPI display; uncapped, a 3x phone pays triple fill
    // cost for a background nobody is looking at directly.
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = Math.round(canvasWidth * dpr);
    canvas.height = Math.round(canvasHeight * dpr);
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    centerX = canvasWidth * 0.5;
    centerY = canvasHeight * 0.5;
    context = canvas.getContext('2d');
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
};
window.addEventListener('resize', resize);
resize();

mouseX = centerX;
mouseY = centerY;

for (var i = 0; i < PARTICLE_NUM; i++) {
    particles[i] = randomizeParticle(new Particle());
    particles[i].z -= 500 * Math.random();
}

document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}, false);

// Respect the visitor's motion preference: never start the animation for
// anyone who has asked the OS to reduce motion (CSS also hides the canvas).
var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
var rafId = null;

function tick() {
    loop();
    rafId = window.requestAnimationFrame(tick);
}
function start() {
    if (rafId === null && !(reduceMotion && reduceMotion.matches) && !document.hidden) {
        rafId = window.requestAnimationFrame(tick);
    }
}
function stop() {
    if (rafId !== null) { window.cancelAnimationFrame(rafId); rafId = null; }
}

// Don't burn CPU or battery painting a starfield nobody is looking at.
document.addEventListener('visibilitychange', function () {
    if (document.hidden) { stop(); } else { start(); }
});
if (reduceMotion && reduceMotion.addEventListener) {
    reduceMotion.addEventListener('change', function () {
        if (reduceMotion.matches) { stop(); } else { start(); }
    });
}
start();
})();


// ==================== DISEASE NETWORK ====================
(function(){
const nodes = [
  {id:'tsc', label:'Tuberous sclerosis', x:200, y:160, r:22, cat:'genetic', desc:'Tuberous sclerosis complex (TSC) is a genetic disorder caused by mutations in the TSC1 or TSC2 gene. These genes normally produce proteins (hamartin and tuberin) that act as a brake on cell growth through the mTOR signaling pathway. When either gene is broken, cells grow unchecked, forming benign tumors called hamartomas in the brain, kidneys, heart, lungs, skin, and eyes. Symptoms range from mild skin findings to severe epilepsy, intellectual disability, and organ failure, depending on where and how many tumors form.'},
  {id:'pkd', label:'Polycystic kidney', x:80, y:120, r:20, cat:'genetic', desc:'Polycystic kidney disease (PKD) is a genetic condition where fluid-filled cysts grow throughout the kidneys, gradually replacing normal tissue. The most common form, autosomal dominant PKD (ADPKD), is caused by mutations in PKD1 (chromosome 16) or PKD2 (chromosome 4). Kidneys can grow to several times their normal size. About half of affected people reach end-stage kidney failure by their 50s or 60s and require dialysis or transplant. Cysts can also form in the liver and pancreas, and 5-10% develop brain aneurysms.'},
  {id:'nf', label:'Neurofibromatosis', x:340, y:80, r:22, cat:'genetic', desc:'Neurofibromatosis (NF) is a group of genetic disorders that cause tumors to grow along nerves. NF1 (caused by mutations on chromosome 17) is the most common, affecting about 1 in 3,000 people. It produces cafe-au-lait spots on the skin, benign nerve tumors (neurofibromas) throughout the body, and carries risk of optic gliomas, learning disabilities, scoliosis, and malignant transformation of tumors. NF2 (chromosome 22) primarily causes tumors on the hearing and balance nerves, leading to deafness.'},
  {id:'brain', label:'Brain tumors', x:480, y:120, r:20, cat:'neoplastic', desc:'Brain tumors are abnormal growths inside the skull. They can be benign (non-cancerous, like the SEGAs in TSC or schwannomas in NF2) or malignant (cancerous, like glioblastoma). Even benign brain tumors can be dangerous because the skull is a fixed space: any growth raises intracranial pressure and compresses healthy brain tissue. Symptoms depend on location and can include headaches, seizures, vision loss, personality changes, weakness, and cognitive decline.'},
  {id:'wm', label:'White matter disease', x:340, y:200, r:18, cat:'neuro', desc:'White matter is the tissue in the brain and spinal cord made up of nerve fibers coated in myelin, a fatty insulation that allows electrical signals to travel fast. White matter disease means this insulation is damaged or underdeveloped. Causes include genetic conditions (TSC, NF1), radiation exposure, thyroid deficiency during development, and autoimmune disorders. Symptoms include slowed thinking, memory problems, difficulty with coordination, and in severe cases, progressive cognitive decline. It shows up as bright spots on MRI scans.'},
  {id:'pseudo', label:'Pseudotumor cerebri', x:520, y:240, r:18, cat:'neuro', desc:'Pseudotumor cerebri (also called idiopathic intracranial hypertension or IIH) is a condition where the pressure of cerebrospinal fluid inside the skull is abnormally high, but no tumor or other structural cause can be found. It produces symptoms that mimic a brain tumor: severe headaches, visual disturbances, pulsatile tinnitus (whooshing sound in the ears), and papilledema (swelling of the optic disc). Without treatment, sustained high pressure destroys the optic nerve fibers and causes permanent blindness.'},
  {id:'spina', label:'Spina bifida', x:120, y:320, r:18, cat:'structural', desc:'Spina bifida is a birth defect where the neural tube (the embryonic structure that becomes the brain and spinal cord) fails to close completely during the first month of pregnancy. In the severe form (myelomeningocele), the spinal cord and its covering membranes protrude through an opening in the back. This causes partial or complete paralysis of the legs, loss of bladder and bowel control, and usually involves Chiari II malformation (downward displacement of brain tissue) with hydrocephalus. The milder form (spina bifida occulta) may cause no symptoms at all.'},
  {id:'scoli', label:'Scoliosis', x:260, y:360, r:18, cat:'structural', desc:'Scoliosis is an abnormal sideways curve of the spine. Most cases are idiopathic (no known cause) and mild. But in the context of NF1, spina bifida, or toxic exposure, scoliosis is often a different beast: NF1-associated dystrophic scoliosis involves structurally abnormal vertebrae and progresses rapidly. Spina bifida-associated scoliosis is caused by asymmetric muscle weakness and vertebral malformation. Both types are harder to treat than idiopathic scoliosis and more likely to require surgery.'},
  {id:'ddd', label:'Degenerative disk', x:140, y:420, r:16, cat:'structural', desc:'Degenerative disk disease is the breakdown of the intervertebral disks, the cartilage pads that sit between the vertebrae and act as shock absorbers. As disks lose water content and structural integrity, they compress, bulge, or herniate, pressing on spinal nerves. This causes back pain, sciatica (pain radiating down the leg), stiffness, and reduced mobility. It normally occurs with aging, but can be greatly accelerated by scoliosis (uneven loading), inflammatory arthritis (cytokine damage to disk collagen), or thyroid deficiency (impaired cartilage maintenance).'},
  {id:'arth', label:'Arthritis (various)', x:60, y:240, r:16, cat:'inflammatory', desc:'Arthritis is joint inflammation. In this context, the relevant types are rheumatoid arthritis (an autoimmune condition where the immune system attacks joint linings), ankylosing spondylitis (inflammatory arthritis of the spine and sacroiliac joints), and osteoarthritis accelerated by structural abnormalities. Dioxin and asbestos exposure both produce chronic systemic inflammation that raises the risk of autoimmune arthritis. Scoliosis and spina bifida create mechanical joint stress that accelerates osteoarthritis.'},
  {id:'endo', label:'Endometriosis', x:400, y:400, r:18, cat:'inflammatory', desc:'Endometriosis is a condition where tissue similar to the uterine lining grows outside the uterus, on the ovaries, fallopian tubes, bowel, and pelvic lining. This tissue responds to menstrual hormones, swelling and bleeding each cycle but with no way to exit the body. The result is chronic inflammation, scar tissue (adhesions), severe pain, and infertility. It affects an estimated 10% of women of reproductive age but takes an average of 7-10 years to diagnose. Dioxin exposure is a documented risk factor through estrogen pathway disruption and mTOR activation.'},
  {id:'mental', label:'Mental/cognitive', x:540, y:360, r:20, cat:'neuro', sub:'Depression, anxiety, ASD, ADHD', desc:'Mental and cognitive conditions in this context include depression, anxiety, attention deficit hyperactivity disorder (ADHD), autism spectrum disorder (ASD), intellectual disability, and executive function deficits. These are not separate coincidences but downstream effects of the same genetic and exposure-related damage. TSC disrupts synaptic pruning via mTOR, causing ASD and intellectual disability. NF1 disrupts dopamine signaling, causing ADHD and learning disabilities. White matter damage from radiation, thyroid deficiency, or hydrocephalus impairs processing speed and executive function. Chronic pain and inflammation from endometriosis, arthritis, or pseudotumor cerebri drive depression and anxiety.'},
  {id:'vision', label:'Vision disorders', x:560, y:160, r:18, cat:'neuro', sub:'Optic gliomas, papilledema', desc:'Vision disorders in this context include optic pathway gliomas (tumors on the optic nerve, common in NF1), papilledema (swelling of the optic disc from raised brain pressure, the hallmark of pseudotumor cerebri), retinal hamartomas (benign retinal tumors in TSC), Lisch nodules (iris hamartomas in NF1), radiation cataracts (clouding of the lens from cumulative radiation exposure), and visual field loss from brain tumors compressing the visual pathways. Any combination of these can occur in the same person, and each has a different cause requiring different treatment.'},
  {id:'repro', label:'Reproductive issues', x:300, y:480, r:18, cat:'inflammatory', sub:'Infertility, hormonal', desc:'Reproductive issues here include infertility (from endometriosis, hormonal disruption, or gonadal damage from radiation/chemicals), recurrent miscarriage (from dioxin exposure, thyroid dysfunction, or chromosomal abnormalities in damaged sperm/eggs), menstrual irregularity (from thyroid suppression by perchlorate or estrogen disruption by dioxin), reduced sperm count and quality (from chromium, radiation, and hydrazine exposure), and complications in pregnancy for women with spina bifida (high-risk obstetric management required). The damage can originate in either the exposed person or their unexposed partner who inherited damaged DNA.'},
  {id:'thyroid', label:'Thyroid dysfunction', x:452, y:296, r:17, cat:'endocrine', desc:'Thyroid dysfunction covers an underactive thyroid (hypothyroidism), autoimmune thyroid disease (Hashimoto’s), and thyroid nodules or cancer. The gland concentrates iodine to build thyroid hormone, which makes it uniquely vulnerable to two of the exposures on this page: ammonium perchlorate blocks iodine uptake at the transporter, and radioactive iodine delivers a concentrated radiation dose to the tissue that absorbs it. During pregnancy the consequences fall on the fetus rather than the mother. Fetal brain development depends on maternal thyroid hormone through the first trimester, before the fetal thyroid is working at all. Insufficient hormone during that window impairs neuronal migration, myelination of white matter, and neural tube closure. A mother can have thyroid suppression mild enough to go undiagnosed and still deliver a child with measurable developmental effects.'},
  {id:'digits', label:'Extra digits/limbs', x:80, y:440, r:16, cat:'structural', sub:'Polydactyly', desc:'Polydactyly (extra fingers or toes) and other limb malformations result from disruption of the signaling pathways that pattern the developing limb during weeks 4-8 of pregnancy. The Sonic Hedgehog and Wnt pathways determine how many fingers form and where. Dioxin, radiation, hydrazine, and chromium all interfere with these pathways through direct DNA mutation or disrupted gene regulation. Polydactyly also co-occurs with neural tube defects in several genetic syndromes (Meckel-Gruber, Smith-Lemli-Opitz, trisomy 13). It is visible at birth and should trigger genetic evaluation when a parent has occupational toxic exposure history.'},
];
const pathways = {
  'mtor': {color:'#7F77DD', label:'mTOR pathway'},
  'chr16': {color:'#1D9E75', label:'Chromosome 16p13.3'},
  'phako': {color:'#D85A30', label:'Tumor suppressor / phakomatosis'},
  'neural': {color:'#378ADD', label:'Neural tube / brain development'},
  'inflam': {color:'#D4537E', label:'Inflammatory / autoimmune'},
  'struct': {color:'#888780', label:'Skeletal / structural'},
  'endocrine': {color:'#BA7517', label:'Hormone disruption'},
  'icp': {color:'#E24B4A', label:'Brain pressure (intracranial)'},
};
const edges = [
  {from:'tsc',to:'pkd',path:'chr16',info:'The TSC2 gene and the PKD1 gene are right next to each other on chromosome 16. When a large piece of that chromosome gets deleted (which radiation or alkylating chemicals can cause), both genes get knocked out at once. The person develops both tuberous sclerosis and polycystic kidney disease. Brook-Carter et al. documented this contiguous gene syndrome in 1994.'},
  {from:'tsc',to:'brain',path:'mtor',info:'Tuberous sclerosis disables a protein (tuberin) that normally keeps cell growth in check through the mTOR pathway. Without it, cells in the brain grow into tumors called subependymal giant cell astrocytomas (SEGAs). The drug everolimus, which blocks mTOR, can shrink these tumors. Krueger et al. (2010) published the trial data.'},
  {from:'tsc',to:'wm',path:'phako',info:'During fetal brain development, neurons migrate from the center of the brain outward to the cortex. In TSC, this migration goes wrong, leaving clumps of disorganized cells called cortical tubers and streaks of abnormal white matter called radial migration lines. Over 90% of TSC patients show these on brain MRI.'},
  {from:'tsc',to:'nf',path:'phako',info:'Both TSC and NF belong to a group called phakomatoses (neurocutaneous syndromes). Both are caused by broken tumor-suppressor genes. Both produce benign growths (hamartomas) in the brain, skin, and other organs. Doctors who see one should screen for features of the other, since they share diagnostic patterns and occasionally co-occur.'},
  {from:'tsc',to:'mental',path:'mtor',info:'About half of people with TSC have intellectual disability. Between 40-50% meet criteria for autism spectrum disorder, and 30-50% have ADHD. Researchers call this cluster TAND (TSC-Associated Neuropsychiatric Disorders). The mTOR pathway, when overactive, disrupts the pruning of unnecessary brain connections during childhood, which is thought to drive these symptoms.'},
  {from:'tsc',to:'vision',path:'phako',info:'About half of TSC patients have retinal hamartomas (small benign tumors on the retina). Most don\'t cause symptoms, but they can occasionally affect peripheral vision. They are found during dilated eye exams and are one of the diagnostic criteria for TSC.'},
  {from:'tsc',to:'repro',path:'mtor',info:'TSC causes kidney tumors called angiomyolipomas and a lung condition called LAM (lymphangioleiomyomatosis), both of which disproportionately affect women. Estrogen appears to accelerate mTOR-driven tumor growth, which is why LAM almost exclusively appears in women of reproductive age.'},
  {from:'nf',to:'brain',path:'phako',info:'NF1 causes optic pathway gliomas (tumors on the optic nerve) in 15-20% of affected children. NF2 causes bilateral vestibular schwannomas (tumors on the hearing/balance nerves) in over 90% of cases. Both happen because the tumor-suppressor gene (neurofibromin in NF1, merlin in NF2) is disabled, allowing unchecked cell growth along nerves.'},
  {from:'nf',to:'scoli',path:'struct',info:'Between 10-26% of people with NF1 develop dystrophic scoliosis. Unlike ordinary scoliosis, this type involves abnormally shaped vertebrae (scalloping), thinned ribs (penciling), and weakness of the dural sac around the spinal cord. It usually gets worse faster than idiopathic scoliosis and more often requires surgery.'},
  {from:'nf',to:'wm',path:'phako',info:'Brain MRIs of children with NF1 frequently show bright spots on T2-weighted images, called UBOs (unidentified bright objects). These appear in 60-70% of NF1 children and represent areas where the myelin (nerve insulation) has swollen or vacuolized. Most shrink by adulthood, but their presence during development may contribute to the learning problems seen in NF1.'},
  {from:'nf',to:'pseudo',path:'icp',info:'Several case series have reported pseudotumor cerebri in NF1 patients. The proposed explanation is that NF1 can cause dural ectasia (weakening and expansion of the membrane around the brain and spinal cord) or abnormal venous drainage, both of which could raise cerebrospinal fluid pressure. Creange et al. described this association in 1999.'},
  {from:'nf',to:'vision',path:'phako',info:'Optic gliomas in NF1, Lisch nodules (small brown bumps on the iris, present in nearly all adult NF1 patients and used as a diagnostic sign), and cataracts in NF2 are all well-documented. Annual eye exams are standard care for NF patients.'},
  {from:'nf',to:'mental',path:'neural',info:'30-65% of NF1 patients have learning disabilities. About 40% have ADHD. The NF1 gene makes a protein called neurofibromin that regulates a cell signaling cascade (Ras-MAPK) in neurons. When this regulation fails, it affects dopamine and GABA signaling in the brain, which are the same neurotransmitter systems implicated in ADHD and learning disorders.'},
  {from:'nf',to:'digits',path:'struct',info:'NF1 can cause overgrowth of a limb when a plexiform neurofibroma (a large, diffuse nerve tumor) involves the nerves of that limb. Tibial pseudarthrosis (the shinbone breaks and won\'t heal) affects about 5% of NF1 patients. These represent limb abnormalities that co-occur in the same genetic syndrome and could overlap with polydactyly in families with additional mutagenic exposure.'},
  {from:'spina',to:'scoli',path:'struct',info:'Between 50-90% of children with myelomeningocele (the severe, open form of spina bifida) develop scoliosis. The causes are twofold: the vertebrae themselves may be malformed where the spine didn\'t close, and the muscles on one side of the spine may be weaker than the other because the spinal nerves were damaged.'},
  {from:'spina',to:'wm',path:'neural',info:'Nearly all children with myelomeningocele also have a Chiari II malformation, where the lower part of the brain gets pulled downward through the opening at the base of the skull. This distorts brain development and produces white matter abnormalities, hydrocephalus (fluid buildup in the brain), and underdevelopment of the corpus callosum (the bridge connecting the left and right hemispheres).'},
  {from:'spina',to:'pseudo',path:'icp',info:'The hydrocephalus that accompanies Chiari II malformation changes the pressure dynamics inside the skull. Most of these children receive a shunt (a tube that drains excess fluid). When the shunt partially clogs, the pressure rises in a pattern that can mimic pseudotumor cerebri, with headaches, vision changes, and papilledema.'},
  {from:'spina',to:'mental',path:'neural',info:'Even children with spina bifida who have normal IQ scores often have problems with executive function (planning, organizing, following multi-step instructions) and attention. The hydrocephalus and Chiari II malformation damage white matter tracts that connect the frontal lobes to the rest of the brain.'},
  {from:'spina',to:'digits',path:'struct',info:'Neural tube defects and limb malformations (including polydactyly) co-occur in several genetic syndromes: Meckel-Gruber syndrome, Smith-Lemli-Opitz syndrome, and trisomy 13. A child born with both spina bifida and extra digits should be evaluated for these syndromes, especially with a family history of toxic exposure.'},
  {from:'spina',to:'repro',path:'neural',info:'Spina bifida causes neurogenic bladder (the bladder nerves don\'t work properly), which affects fertility through recurrent infections and difficulty with sexual function. Women with spina bifida who do become pregnant face higher rates of preterm delivery and need specialized obstetric management.'},
  {from:'pseudo',to:'vision',path:'icp',info:'Papilledema (swelling of the optic disc due to raised brain pressure) is the defining finding in pseudotumor cerebri. The optic nerve is wrapped in the same fluid-filled membrane as the brain, so when brain pressure rises, the back of the eye swells. If the pressure stays high without treatment, the optic nerve fibers die permanently. Between 10-25% of untreated patients develop significant permanent vision loss.'},
  {from:'pseudo',to:'mental',path:'icp',info:'Chronic high brain pressure causes persistent headaches, difficulty concentrating, and a foggy feeling that patients describe as cognitive dysfunction. Depression and anxiety are common. Kleinschmidt et al. (2000) found significant psychiatric comorbidity in patients with idiopathic intracranial hypertension (IIH), the formal name for pseudotumor cerebri.'},
  {from:'endo',to:'repro',path:'inflam',info:'Endometriosis is a leading cause of infertility. Between 30-50% of women who cannot conceive have endometriosis found when investigated. The endometrial tissue that grows outside the uterus causes inflammation, adhesions (scar tissue that glues organs together), and hormonal disruption, all of which impair egg release, fertilization, and implantation.'},
  {from:'endo',to:'arth',path:'inflam',info:'Women with endometriosis have a higher rate of autoimmune conditions, including rheumatoid arthritis. Harris et al. (2016) found this in a large prospective cohort. The same overactive inflammatory signals (cytokines like TNF-alpha and IL-6) that drive endometriosis also drive joint inflammation.'},
  {from:'endo',to:'mental',path:'inflam',info:'Between 50-80% of women with endometriosis report depression or anxiety. Chronic pelvic pain accounts for part of this, but inflammatory cytokines from endometriosis also cross the blood-brain barrier and directly affect mood regulation. Hormonal disruption from the disease and its treatments adds another layer.'},
  {from:'pkd',to:'brain',path:'mtor',info:'People with autosomal dominant polycystic kidney disease (ADPKD caused by PKD1 mutations) have a 5-10% chance of developing intracranial aneurysms (weak spots in brain blood vessels that can balloon and rupture). The connection runs through mTOR, which regulates blood vessel wall integrity as well as kidney tubule growth.'},
  {from:'arth',to:'ddd',path:'inflam',info:'Inflammatory arthritis (rheumatoid arthritis, ankylosing spondylitis) accelerates degeneration of the spinal disks. The same inflammatory molecules (TNF-alpha, IL-6) that attack joint cartilage also break down the collagen and proteoglycans in intervertebral disks. A person with inflammatory arthritis in their 30s may have disk degeneration that looks decades older on MRI.'},
  {from:'scoli',to:'ddd',path:'struct',info:'A curved spine distributes weight unevenly across the disks. The disks on the concave side of the curve get compressed, while the convex side gets stretched. Over years, this asymmetric loading wears the compressed disks down faster. Long-term studies of scoliosis patients show accelerated disk degeneration at and adjacent to the level of the curve.'},
  {from:'endo',to:'pkd',path:'mtor',info:'This is a newer finding. The mTOR signaling pathway is overactive in both endometriotic tissue and in the cells lining kidney cysts in PKD. Drugs called rapamycin analogs (everolimus, sirolimus) have been studied for both conditions because they block mTOR. The clinical overlap between endometriosis and PKD in the same families has been noted but not yet studied in a large cohort.'},
  {from:'brain',to:'vision',path:'phako',info:'Brain tumors, especially those in the back of the brain (posterior fossa) or along the optic pathway, can compress the nerves and tracts that carry visual information. Separately, any brain tumor that raises intracranial pressure causes papilledema, which damages vision through the same mechanism described under pseudotumor cerebri.'},
  {from:'brain',to:'mental',path:'neural',info:'The cognitive effects of brain tumors depend on location and treatment. Frontal lobe tumors affect planning, judgment, and personality. Temporal lobe tumors affect memory and language. Chemotherapy and radiation used to treat brain tumors cause their own long-term damage to white matter, producing lasting problems with processing speed and memory even after the tumor is gone.'},
  {from:'thyroid',to:'wm',path:'endocrine',info:'Thyroid hormone drives myelination — the process that wraps nerve fibres in the fatty insulation that makes up white matter. The fetus cannot make its own thyroid hormone until roughly week 16 and depends entirely on the mother until then. Maternal hypothyroidism during that window produces measurable white matter abnormalities and reduced processing speed in the child. Perchlorate exposure suppresses maternal thyroid function through exactly this window (Zoeller & Rovet, 2004).'},
  {from:'thyroid',to:'spina',path:'endocrine',info:'Neural tube closure happens between days 21 and 28 of gestation, often before a pregnancy is confirmed. The process depends on adequate thyroid hormone and adequate folate. Thyroid hormone regulates the genes controlling neural crest cell migration; when it is insufficient, closure can fail, producing spina bifida or anencephaly. This is the mechanism by which a chemical that never touches DNA — perchlorate — produces a structural birth defect (Zoeller & Rovet, 2004).'},
  {from:'thyroid',to:'mental',path:'endocrine',info:'Maternal thyroid hormone deficiency in the first trimester is associated with lower IQ in the child, and the effect is dose-dependent. Haddow et al. (1999) found children of untreated hypothyroid mothers scored on average 7 IQ points lower than controls. Attention deficits and language delay are also elevated. The damage is done before birth and is not reversed by treating the child’s thyroid afterwards.'},
  {from:'thyroid',to:'repro',path:'endocrine',info:'Thyroid dysfunction disrupts the menstrual cycle, impairs ovulation, and raises miscarriage risk. Both hypothyroidism and autoimmune thyroid disease are over-represented in women investigated for infertility and recurrent pregnancy loss. Because thyroid antibodies raise miscarriage risk even when hormone levels look normal, antibody testing is worth requesting alongside a standard thyroid panel.'},
  {from:'thyroid',to:'endo',path:'endocrine',info:'Autoimmune thyroid disease and endometriosis co-occur more often than chance. Both are estrogen-responsive inflammatory conditions, and both are elevated in dioxin-exposed populations. Sinaii et al. (2002) found hypothyroidism reported at more than seven times the expected rate among women with endometriosis in a large survey.'},
];
const catColors = {genetic:'#7F77DD', neoplastic:'#E24B4A', neuro:'#378ADD', structural:'#888780', inflammatory:'#D4537E', endocrine:'#BA7517'};
const svg = document.getElementById('net');
const ns = 'http://www.w3.org/2000/svg';
// SVG shapes are not focusable by default. Give every interactive shape a tab
// stop, an accessible name, and Enter/Space activation so the diagram is usable
// without a mouse.
function makeOperable(el, label, activate){
  el.setAttribute('tabindex','0');
  el.setAttribute('role','button');
  el.setAttribute('aria-label',label);
  el.addEventListener('click', activate);
  el.addEventListener('keydown', ev => {
    if(ev.key==='Enter'||ev.key===' '||ev.key==='Spacebar'){ ev.preventDefault(); activate(); }
  });
}
let activePathway = null;
const edgeEls = [];
edges.forEach((e,i) => {
  const n1 = nodes.find(n=>n.id===e.from), n2 = nodes.find(n=>n.id===e.to);
  const dx=n2.x-n1.x, dy=n2.y-n1.y, dist=Math.sqrt(dx*dx+dy*dy);
  const ox1=n1.x+(dx/dist)*n1.r, oy1=n1.y+(dy/dist)*n1.r;
  const ox2=n2.x-(dx/dist)*n2.r, oy2=n2.y-(dy/dist)*n2.r;
  const mx=(ox1+ox2)/2+(Math.abs(dy)>Math.abs(dx)?1:-1)*(dist*0.08)*(i%2?1:-1);
  const my=(oy1+oy2)/2+(Math.abs(dx)>Math.abs(dy)?1:-1)*(dist*0.08)*(i%2?1:-1);
  const line = document.createElementNS(ns,'path');
  line.setAttribute('d',`M${ox1} ${oy1} Q${mx} ${my} ${ox2} ${oy2}`);
  line.setAttribute('fill','none'); line.setAttribute('stroke',pathways[e.path].color);
  line.setAttribute('stroke-width','1.5'); line.setAttribute('opacity','0.5');
  line.setAttribute('stroke-linecap','round'); line.style.cursor='pointer';
  line.style.transition='opacity 0.2s, stroke-width 0.2s';
  const nn1=nodes.find(n=>n.id===e.from).label, nn2=nodes.find(n=>n.id===e.to).label;
  makeOperable(line, `Evidence linking ${nn1} and ${nn2} via ${pathways[e.path].label}`, ()=>{
    document.getElementById('info1').innerHTML=`<div class="info-title">${nn1} and ${nn2} <span style="color:${pathways[e.path].color}">(${pathways[e.path].label})</span></div>${e.info}`;
  });
  const emphasize=()=>{line.setAttribute('stroke-width','3');line.setAttribute('opacity','0.9');};
  line.addEventListener('mouseenter',emphasize);
  line.addEventListener('focus',emphasize);
  const relax=()=>{line.setAttribute('stroke-width',activePathway&&e.path!==activePathway?'0.5':'1.5');line.setAttribute('opacity',activePathway&&e.path!==activePathway?'0.1':'0.5');};
  line.addEventListener('mouseleave',relax);
  line.addEventListener('blur',relax);
  svg.appendChild(line); edgeEls.push({el:line,data:e});
});
nodes.forEach(n=>{
  const g=document.createElementNS(ns,'g'); g.style.cursor='pointer';
  const circ=document.createElementNS(ns,'circle');
  circ.setAttribute('cx',n.x);circ.setAttribute('cy',n.y);circ.setAttribute('r',n.r);
  circ.setAttribute('fill',catColors[n.cat]);circ.setAttribute('opacity','0.15');
  circ.setAttribute('stroke',catColors[n.cat]);circ.setAttribute('stroke-width','1.5');
  g.appendChild(circ);
  const t=document.createElementNS(ns,'text');
  t.setAttribute('x',n.x);t.setAttribute('y',n.y+n.r+14);t.setAttribute('text-anchor','middle');
  t.classList.add('node-label');t.textContent=n.label;g.appendChild(t);
  if(n.sub){const ts=document.createElementNS(ns,'text');ts.setAttribute('x',n.x);ts.setAttribute('y',n.y+n.r+26);ts.setAttribute('text-anchor','middle');ts.classList.add('node-sublabel');ts.textContent=n.sub;g.appendChild(ts);}
  makeOperable(g, `${n.label}: description and connected conditions`, ()=>{
    const conns=edges.filter(e=>e.from===n.id||e.to===n.id);
    const partners=conns.map(e=>{const o=e.from===n.id?e.to:e.from;return nodes.find(nd=>nd.id===o).label;});
    document.getElementById('info1').innerHTML=`<div class="info-title">${n.label}${n.sub?' ('+n.sub+')':''}</div><p style="margin:6px 0 8px">${n.desc}</p><b>Connected to ${conns.length} other conditions:</b> ${partners.join(', ')}. Click any colored line for the research linking them.`;
  });
  const lift=()=>circ.setAttribute('opacity','0.3');
  const settle=()=>circ.setAttribute('opacity','0.15');
  g.addEventListener('mouseenter',lift); g.addEventListener('focus',lift);
  g.addEventListener('mouseleave',settle); g.addEventListener('blur',settle);
  svg.appendChild(g);
});
// ---------------------------------------------------------------------------
// Compact view of the network.
//
// Every condition renders twice:
//
//   1. As a tile in an equal-width grid. Sixteen full-width accordion rows cost
//      roughly 700px of scroll even when collapsed; the same sixteen as tiles
//      cost about 300px, and clicking one opens a modal rather than pushing the
//      rest of the page down.
//   2. As a full article in a hidden container, which is what the modal shows,
//      what a screen reader can reach, what prints, and what a crawler indexes.
//      Nothing here is loaded on demand, so no content depends on JavaScript
//      having run or on the modal having been opened.
// ---------------------------------------------------------------------------
const catLabels={genetic:'Genetic',neoplastic:'Neoplastic',neuro:'Brain and nerve',structural:'Structural',inflammatory:'Inflammatory',endocrine:'Endocrine'};
const netGrid=document.getElementById('net-grid');
const netDetails=document.getElementById('net-details');
const dlg=document.getElementById('condition-dialog');
const dlgBody=document.getElementById('condition-dialog-body');
const dlgTitle=document.getElementById('condition-dialog-title');

function connectionsFor(n){
  return edges.filter(e=>e.from===n.id||e.to===n.id);
}

function detailMarkup(n){
  const conns=connectionsFor(n);
  const links=conns.map(e=>{
    const otherId=e.from===n.id?e.to:e.from;
    const other=nodes.find(nd=>nd.id===otherId);
    return `<li><a href="#condition-${otherId}" data-condition="${otherId}"><b>${other.label}</b></a> `+
           `<span class="pathway-tag" style="color:${pathways[e.path].color}">${pathways[e.path].label}</span>`+
           `<br>${e.info}</li>`;
  }).join('');
  return `<p class="net-detail-cat">${catLabels[n.cat]||n.cat} \u00b7 connected to `+
         `${conns.length} other condition${conns.length===1?'':'s'}</p>`+
         `<p>${n.desc}</p>`+
         `<ul class="net-list-links">${links}</ul>`;
}

if(netGrid&&netDetails){
  nodes.forEach(n=>{
    const conns=connectionsFor(n);

    const tile=document.createElement('button');
    tile.type='button';
    tile.className='net-tile';
    tile.dataset.condition=n.id;
    tile.setAttribute('aria-haspopup','dialog');
    // The count is a bare numeral so the label keeps the width. The word it
    // stands for lives in the tooltip and the accessible name.
    const plural=conns.length===1?'connection':'connections';
    tile.title=`${n.label} — ${conns.length} ${plural}`;
    tile.setAttribute('aria-label',`${n.label}, ${conns.length} ${plural}`);
    tile.innerHTML=
      `<span class="net-tile-dot" style="background:${catColors[n.cat]}"></span>`+
      `<span class="net-tile-label">${n.label}</span>`+
      `<span class="net-tile-meta" aria-hidden="true">${conns.length}</span>`;
    netGrid.appendChild(tile);

    // The indexable, printable, no-JavaScript copy.
    const art=document.createElement('article');
    art.className='net-detail';
    art.id='condition-'+n.id;
    art.innerHTML=`<h4>${n.label}</h4>`+detailMarkup(n);
    netDetails.appendChild(art);
  });
}

// --- Modal -----------------------------------------------------------------
let lastFocused=null;

function openCondition(id,trigger){
  const n=nodes.find(nd=>nd.id===id);
  if(!n||!dlg)return;
  dlgTitle.textContent=n.label;
  dlgBody.innerHTML=detailMarkup(n);
  dlgBody.scrollTop=0;
  if(!dlg.open){
    // Remember the element that opened this, so focus can go back to it. Taken
    // from the trigger rather than document.activeElement: a click does not
    // always leave the button focused, and a cross-reference inside the dialog
    // must not overwrite the original opener.
    lastFocused=trigger||document.activeElement;
    if(typeof dlg.showModal==='function')dlg.showModal();
    else dlg.setAttribute('open','');
  }
}

function closeCondition(){
  if(!dlg||!dlg.open)return;
  if(typeof dlg.close==='function')dlg.close();
  else dlg.removeAttribute('open');
}

if(dlg){
  // Tile opens it; a cross-reference inside it swaps to the next condition
  // rather than closing and reopening.
  document.addEventListener('click',ev=>{
    const trigger=ev.target.closest('[data-condition]');
    if(!trigger)return;
    ev.preventDefault();
    openCondition(trigger.dataset.condition, trigger.closest('.net-tile') || trigger);
  });

  // Clicking the backdrop closes. The dialog element fills its own box, so a
  // click landing on <dialog> itself is a click outside the panel.
  dlg.addEventListener('click',ev=>{ if(ev.target===dlg)closeCondition(); });
  dlg.addEventListener('close',()=>{
    if(lastFocused&&document.contains(lastFocused))lastFocused.focus();
    lastFocused=null;
  });
  const closeBtn=document.getElementById('condition-dialog-close');
  if(closeBtn)closeBtn.addEventListener('click',closeCondition);
}

// Deep links such as #condition-tsc open the modal instead of jumping to the
// hidden copy, so a shared link lands somewhere that looks intentional.
function openFromHash(){
  const m=/^#condition-([a-z0-9]+)$/.exec(window.location.hash||'');
  if(m)openCondition(m[1]);
}
window.addEventListener('hashchange',openFromHash);
openFromHash();

const leg=document.getElementById('legend1');
// Only offer a filter for pathways that actually connect something. A legend
// entry with no edges renders as a control that blanks the whole graph.
const usedPathways=new Set(edges.map(e=>e.path));
Object.entries(pathways).filter(([key])=>usedPathways.has(key)).forEach(([key,val])=>{
  const d=document.createElement('button');d.className='legend-item';
  d.type='button'; d.setAttribute('aria-pressed','false');
  d.innerHTML=`<span class="legend-swatch" style="background:${val.color}"></span>${val.label}`;
  d.addEventListener('click',()=>{
    if(activePathway===key)activePathway=null;else activePathway=key;
    edgeEls.forEach(({el,data})=>{
      if(!activePathway){el.setAttribute('opacity','0.5');el.setAttribute('stroke-width','1.5');}
      else if(data.path===activePathway){el.setAttribute('opacity','0.7');el.setAttribute('stroke-width','2');}
      else{el.setAttribute('opacity','0.08');el.setAttribute('stroke-width','0.5');}
    });
    leg.querySelectorAll('.legend-item').forEach(el=>{el.classList.remove('dimmed');el.setAttribute('aria-pressed','false');});
    if(activePathway){
      leg.querySelectorAll('.legend-item').forEach(el=>{if(el!==d)el.classList.add('dimmed');});
      d.setAttribute('aria-pressed','true');
    }
  });
  leg.appendChild(d);
});
})();

// ==================== EXPOSURE PATHWAYS ====================
(function(){
const exposures = [
  {id:'ao',short:'Agent Orange (Dioxin / TCDD)',mechanism:'Binds the AhR receptor inside cells, reprograms which genes are active, disrupts estrogen and androgen signaling, and creates DNA adducts. Effects can be transmitted to children and grandchildren through altered epigenetic tags on sperm DNA.',targets:[
    {d:'spina',name:'Spina bifida',strength:'strong',note:'The VA recognizes spina bifida as a presumptive condition in children of Vietnam veterans exposed to Agent Orange. Multiple studies in Vietnamese and American populations confirmed elevated rates of neural tube defects in offspring of exposed individuals. Ngo et al. (2006) and the National Academies of Sciences (2018) both reviewed this evidence.'},
    {d:'brain',name:'Brain tumors',strength:'moderate',note:'The link between dioxin and soft-tissue sarcomas and non-Hodgkin lymphoma is well established. Brain tumor risk is elevated in some exposed cohorts, though the evidence is less uniform. Hardell et al. (2007) found increased brain tumor rates in people with high dioxin exposure.'},
    {d:'endo',name:'Endometriosis',strength:'strong',note:'Rier et al. (1993) exposed rhesus monkeys to TCDD (the most toxic dioxin in Agent Orange) and found dose-dependent endometriosis. Monkeys given higher doses developed worse disease. Human epidemiological studies support the same pattern. Dioxin activates inflammatory pathways and disrupts estrogen signaling, both of which promote endometrial tissue growth outside the uterus.'},
    {d:'digits',name:'Extra digits / limb defects',strength:'moderate',note:'Increased rates of birth defects including extra fingers and toes have been documented in Vietnamese populations near spraying zones and in offspring of American veterans. Le and Johansson (2001) reviewed this evidence. Dioxin disrupts the Sonic Hedgehog and Wnt signaling pathways during limb development.'},
    {d:'mental',name:'Mental / cognitive',strength:'moderate',note:'Children of exposed veterans and Vietnamese populations show elevated rates of neurodevelopmental problems. Dioxin disrupts thyroid hormone, which the fetal brain requires for normal development during the first and second trimesters.'},
    {d:'repro',name:'Reproductive issues',strength:'strong',note:'The Ranch Hand study (following Air Force personnel who sprayed Agent Orange) documented reduced fertility, hormonal abnormalities, and increased miscarriage rates. Dioxin binds to estrogen and androgen pathways and disrupts ovulation, sperm production, and pregnancy maintenance.'},
    {d:'vision',name:'Vision disorders',strength:'emerging',note:'Animal studies have shown retinal and optic nerve toxicity at high dioxin doses. Human data on vision-specific effects is limited, but the AhR receptor is expressed in retinal tissue.'},
    {d:'scoli',name:'Scoliosis',strength:'emerging',note:'Scoliosis appears in children of exposed veterans alongside spina bifida. It has not been isolated as an independent effect of dioxin separate from the neural tube defect pathway.'},
    {d:'pkd',name:'Polycystic kidney disease',strength:'emerging',note:'AhR activation affects kidney tubule development. The Wnt and mTOR pathways, both activated by dioxin through AhR, are also the pathways that go wrong in polycystic kidney disease. No large human study has tested this connection directly, but the biological plausibility is there.'},
  ]},
  {id:'cr6',short:'Hexavalent Chromium (Cr VI)',mechanism:'Enters cells disguised as sulfate through the same transporter, then gets reduced inside the cell into reactive chromium ions that physically crosslink DNA strands. The cell\'s repair machinery makes errors trying to fix the crosslinks, and those errors become permanent mutations.',targets:[
    {d:'brain',name:'Brain tumors',strength:'moderate',note:'Workers exposed to hexavalent chromium show elevated rates of brain and CNS tumors. Gibb et al. (2015) documented this in a large occupational cohort. Hexavalent chromium can cross the blood-brain barrier because it enters cells through the same sulfate transporter found in brain tissue.'},
    {d:'repro',name:'Reproductive issues',strength:'strong',note:'Men exposed to hexavalent chromium have reduced sperm counts and more abnormal sperm. Women living near chromium waste sites have higher rates of miscarriage and stillbirth. Li et al. (2001) and Kumar and Sagar (2020) reviewed this evidence.'},
    {d:'digits',name:'Extra digits / limb defects',strength:'moderate',note:'Hexavalent chromium is teratogenic in animal studies. Clusters of birth defects have been documented near chromium waste disposal sites in India (Sharma et al., 2012).'},
    {d:'mental',name:'Mental / cognitive',strength:'emerging',note:'Hexavalent chromium causes oxidative damage to nerve tissue. Workers chronically exposed show measurable cognitive deficits compared to unexposed controls (Kuo et al., 2018).'},
    {d:'arth',name:'Arthritis',strength:'emerging',note:'Hexavalent chromium triggers inflammatory cascades through oxidative stress. Workers with chronic exposure report joint pain and stiffness at rates above the general population.'},
  ]},
  {id:'ap',short:'Ammonium Perchlorate',mechanism:'Blocks the sodium-iodide symporter (NIS) in the thyroid gland, preventing iodine uptake. Without iodine, the thyroid cannot produce thyroid hormone. During pregnancy, fetal brain development and neural tube closure both depend on adequate thyroid hormone from the mother.',targets:[
    {d:'mental',name:'Mental / cognitive',strength:'strong',note:'The fetal brain requires thyroid hormone to develop normally, especially during the first trimester. Ammonium perchlorate blocks thyroid hormone production by jamming the iodine transporter. Korevaar et al. (2016) showed that even mild maternal thyroid underfunction during early pregnancy is associated with lower IQ and higher rates of ADHD in the child.'},
    {d:'repro',name:'Reproductive issues',strength:'strong',note:'Thyroid hormone regulates ovulation, uterine lining development, and pregnancy maintenance. Women with thyroid suppression from ammonium perchlorate exposure experience irregular periods, difficulty conceiving, and higher miscarriage rates.'},
    {d:'spina',name:'Spina bifida',strength:'moderate',note:'Thyroid hormone is involved in neural tube closure during weeks 3-4 of pregnancy. Maternal hypothyroxinemia (low thyroid hormone despite normal TSH) during this window increases the risk of neural tube defects.'},
    {d:'wm',name:'White matter disease',strength:'moderate',note:'Myelin (the insulation on nerve fibers that makes up white matter) requires thyroid hormone for its production. Oligodendrocytes, the cells that make myelin, do not mature properly without thyroid signaling. Zoeller and Rovet (2004) reviewed this evidence.'},
    {d:'ddd',name:'Degenerative disk disease',strength:'emerging',note:'Thyroid hormone regulates cartilage metabolism. Animal models of hypothyroidism show accelerated disk degeneration. No human study has directly linked ammonium perchlorate exposure to disk disease.'},
    {d:'scoli',name:'Scoliosis',strength:'emerging',note:'Thyroid disruption during skeletal development could affect vertebral formation, and the neural tube effects of ammonium perchlorate are a known risk factor for congenital scoliosis.'},
  ]},
  {id:'asb',short:'Naturally Occurring Asbestos',mechanism:'Microscopic mineral fibers small enough to penetrate individual cells. Once inside, the body cannot break them down. The immune response to stuck fibers produces a continuous flood of free radicals that damage nearby DNA for months and years. The NF-kB inflammatory pathway stays permanently switched on.',targets:[
    {d:'brain',name:'Brain tumors',strength:'emerging',note:'Asbestos is an established cause of mesothelioma and lung cancer. The link to brain tumors is weaker. Some occupational cohort studies (Boffetta et al., 2014) show a small elevation in CNS tumor rates among asbestos-exposed workers.'},
    {d:'arth',name:'Arthritis',strength:'moderate',note:'People exposed to asbestos develop elevated levels of autoimmune markers even before they develop any lung disease. Pfau et al. (2005) documented this in a community exposed to naturally occurring asbestos in Libby, Montana.'},
    {d:'endo',name:'Endometriosis',strength:'emerging',note:'Asbestos activates the NF-kB inflammatory pathway, which is also overactive in endometriotic tissue. Populations with heavy asbestos exposure show higher rates of inflammatory gynecological conditions, though no study has measured endometriosis incidence specifically.'},
    {d:'repro',name:'Reproductive issues',strength:'moderate',note:'Chronic inflammation from asbestos impairs fertility. Heller et al. (1996) documented that asbestos fibers can cross the placenta, meaning a pregnant woman exposed to asbestos passes fibers directly to the fetus.'},
  ]},
  {id:'rad',short:'Ionizing Radiation',mechanism:'Snaps DNA strands in two. A double-strand break (both rails of the DNA ladder cut at the same spot) is extremely difficult for the cell to repair correctly. Misrepaired breaks produce deletions, rearrangements, and point mutations. Radiation also generates free radicals that cause additional oxidative DNA damage. Sperm and egg cells can carry these mutations to the next generation.',targets:[
    {d:'brain',name:'Brain tumors',strength:'strong',note:'The dose-response relationship between radiation and brain tumors is well established across atomic bomb survivors, Chernobyl liquidators, and nuclear industry workers. Preston et al. (2007) quantified this in a large study. Radiation breaks DNA strands, and misrepaired breaks in tumor-suppressor genes enable uncontrolled cell growth.'},
    {d:'pkd',name:'Polycystic kidney disease',strength:'emerging',note:'Irradiated rodents develop kidney cysts at higher rates than controls. The mechanism is likely radiation-induced mutation of genes involved in kidney tubule structure, including PKD1. Human data is limited to case reports.'},
    {d:'wm',name:'White matter disease',strength:'strong',note:'Radiation leukoencephalopathy (white matter destruction from radiation) is well documented in people who received brain radiation and in people accidentally exposed to high doses. Fike et al. (2009) reviewed the pathology: radiation kills oligodendrocytes and damages the small blood vessels that supply white matter.'},
    {d:'mental',name:'Mental / cognitive',strength:'strong',note:'Children exposed to radiation (including in utero) show dose-dependent IQ reductions. Schull (1997) documented this in children exposed during the atomic bombings. The threshold for measurable cognitive effects is around 100 mGy.'},
    {d:'digits',name:'Extra digits / limb defects',strength:'moderate',note:'Birth defect rates, including polydactyly, are elevated in offspring of irradiated parents. The mechanism is mutation in the parent\'s sperm or egg cells before conception.'},
    {d:'vision',name:'Vision disorders',strength:'strong',note:'Radiation cataracts are a well-known occupational hazard. The lens of the eye is particularly sensitive because its cells do not turn over, so damage accumulates. Cataracts appear at cumulative doses above about 0.5 Gy. The ICRP lowered its recommended lens dose limit in 2012.'},
    {d:'repro',name:'Reproductive issues',strength:'strong',note:'Radiation damages eggs and sperm, reducing fertility, increasing miscarriage risk, and raising the rate of birth defects in offspring. Documented in every major radiation-exposed population studied.'},
    {d:'spina',name:'Spina bifida',strength:'moderate',note:'Neural tube defects are elevated in regions with high background radiation and in offspring of irradiated parents. Padmanabhan (2006) reviewed the animal and human evidence.'},
    {d:'tsc',name:'TSC / NF (de novo mutations)',strength:'emerging',note:'Radiation increases the rate of new (de novo) mutations across the genome. TSC2 and NF1 are both large genes, making them bigger targets for random mutations. A parent whose sperm or egg DNA has been damaged by occupational radiation exposure has a higher chance of passing a new TSC2 or NF1 mutation to their child.'},
    {d:'nf',name:'Neurofibromatosis (de novo mutations)',strength:'moderate',note:'About half of all NF1 cases are de novo, meaning the mutation is new in the child and present in neither parent. NF1 is a large gene with an unusually high spontaneous mutation rate, which makes it a sensitive target for anything that raises the background mutation rate in germ cells. Paternal age is an established risk factor for de novo NF1, consistent with mutations accumulating in sperm-producing cells over time; ionizing radiation acts on those same cells.'},
  ]},
  {id:'rf',short:'Hydrazine / UDMH (Rocket Fuel)',mechanism:'Alkylating agents that stick small chemical groups (methyl groups) onto DNA bases, causing them to mispair during copying. A G that should pair with C pairs with T instead, and the wrong letter gets locked into the sequence permanently. UDMH (unsymmetrical dimethylhydrazine) is metabolized into methyldiazonium ion, one of the most potent DNA-alkylating compounds known.',targets:[
    {d:'brain',name:'Brain tumors',strength:'moderate',note:'UDMH (unsymmetrical dimethylhydrazine) produces brain tumors in rodents at relatively low doses. Toth (1977) published these findings. Human epidemiological data is limited because workplace exposure records at aerospace facilities were often poorly maintained.'},
    {d:'repro',name:'Reproductive issues',strength:'moderate',note:'Hydrazine and its derivatives are toxic to reproductive cells. Studies of workers at rocket engine facilities (including Rocketdyne) documented elevated rates of miscarriage. Hydrazine crosses the placenta.'},
    {d:'digits',name:'Extra digits / limb defects',strength:'moderate',note:'Hydrazine is teratogenic in animal models, causing limb bud malformations when exposure occurs during the window of limb development.'},
    {d:'mental',name:'Mental / cognitive',strength:'emerging',note:'The brain is a target organ for hydrazine toxicity. At high acute doses, hydrazine causes seizures and encephalopathy. Effects on brain development in offspring of exposed workers have not been well studied.'},
    {d:'spina',name:'Spina bifida',strength:'emerging',note:'Rodent embryos exposed to hydrazine during neural tube closure develop neural tube defects. No large human study exists.'},
    {d:'pkd',name:'Polycystic kidney disease',strength:'emerging',note:'The kidney is one of the primary organs where hydrazine is metabolized, exposing kidney cells to high local concentrations of reactive alkylating intermediates. Chronic exposure in animal studies produces cystic changes in the kidneys.'},
  ]},
  {id:'tce',short:'TCE / PCE (Chlorinated Solvents)',mechanism:'Trichloroethylene and tetrachloroethylene are degreasing solvents used on almost every military installation and in aerospace machine shops. They dissolve readily into groundwater and persist for decades. Once absorbed, the liver metabolises them into reactive intermediates that bind DNA, and they break down further into vinyl chloride, a known human carcinogen. Unlike most substances on this page, these cross the placenta efficiently and reach the embryo at close to maternal concentration. At Camp Lejeune, TCE in the Hadnot Point supply reached 1,400 micrograms per litre, 280 times the current federal limit, and PCE at Tarawa Terrace reached 215, some 43 times the limit. Contamination ran from the 1950s through 1987 and exposed as many as a million people.',targets:[
    {d:'spina',name:'Spina bifida',strength:'strong',note:'ATSDR lists neural tube defects among the outcomes with positive findings for TCE and PCE. Ruckart et al. (2013) studied 12,493 children born to mothers living at Camp Lejeune between 1968 and 1985 and found first-trimester TCE and benzene exposure raised neural tube defect risk. Both agencies model exposure month by month from the mother’s actual residence, which makes this among the better-characterised exposure-to-birth-defect datasets in existence.'},
    {d:'brain',name:'Brain tumors',strength:'moderate',note:'Ruckart et al. (2013) found childhood cancers, including hematopoietic cancers, elevated in association with PCE and vinyl chloride exposure. ATSDR grades the evidence for TCE and kidney cancer and non-Hodgkin lymphoma in adults as sufficient for causation. Childhood central nervous system tumours are less well characterised than the hematopoietic cancers but are part of the same signal.'},
    {d:'vision',name:'Vision disorders',strength:'moderate',note:'ATSDR lists eye defects and choanal atresia among the birth defects with positive findings for TCE and PCE exposure. These are structural malformations arising in the same first-trimester window as neural tube defects, and they reflect disrupted neural crest cell migration rather than damage to a specific gene.'},
    {d:'repro',name:'Reproductive issues',strength:'moderate',note:'ATSDR lists fetal death, miscarriage, low birth weight and small-for-gestational-age among outcomes with positive findings. Ruckart et al. (2014) examined preterm birth, small for gestational age and birth weight at Camp Lejeune specifically. Benzene, a co-contaminant, is independently associated with miscarriage.'},
    {d:'wm',name:'White matter disease',strength:'emerging',note:'TCE is a documented neurotoxicant in occupational exposure, and the National Academies reviewed neurobehavioural effects in the Camp Lejeune population. Direct evidence for white matter abnormality in prenatally exposed children is limited, but the solvent crosses the placenta and the developing brain is the organ most sensitive to solvent exposure.'},
    {d:'mental',name:'Mental / cognitive',strength:'emerging',note:'Neurobehavioural effects were significant enough that the National Academies reviewed them separately in their assessment of VA clinical guidance for Camp Lejeune conditions. Adult occupational solvent exposure produces measurable cognitive deficits; the prenatal question is biologically plausible and under-studied.'}
  ]},
  {id:'burn',short:'Burn Pits (PM2.5, VOCs, Dioxins)',mechanism:'Open-air burn pits disposed of plastics, electronics, medical waste, munitions and petroleum products, often accelerated with jet fuel. Incomplete combustion of chlorinated plastics generates dioxins — the same class of compound that made Agent Orange harmful — alongside fine particulate matter, benzene, polycyclic aromatic hydrocarbons and heavy metals. Fine particles below 2.5 micrometres cross from lung into bloodstream. The PACT Act of 2022 established presumptive service connection for service since 2 August 1990 in South West Asia and later added further conditions in 2024. Note that the presumptive list is built almost entirely around disease in the veteran; heritable effects in their children remain largely unstudied.',targets:[
    {d:'brain',name:'Brain tumors',strength:'moderate',note:'Brain cancer is on the PACT Act presumptive list for burn pit exposure, which means the VA has accepted the association for benefits purposes without requiring individual proof of causation. That is an administrative and policy determination informed by evidence, not itself an epidemiological finding, but the underlying reviews support it.'},
    {d:'repro',name:'Reproductive issues',strength:'emerging',note:'Dioxins generated by burning chlorinated plastics are the same compounds implicated in the Agent Orange reproductive findings, and the mechanism — AhR binding and endocrine disruption — is identical. Direct study of reproductive outcomes in burn pit cohorts is limited and recent. The VA Airborne Hazards and Open Burn Pit Registry exists partly to make this research possible.'},
    {d:'thyroid',name:'Thyroid dysfunction',strength:'emerging',note:'Dioxin exposure disrupts thyroid hormone regulation, and burn pit emissions contain dioxins. Thyroid effects are documented in other dioxin-exposed populations rather than in burn pit cohorts specifically. This is a plausible-mechanism rating, not an outcome that has been measured in this population.'},
    {d:'spina',name:'Spina bifida',strength:'emerging',note:'No burn pit cohort study has examined neural tube defects in offspring. The rating reflects the dioxin content of burn pit emissions and the established Agent Orange association with spina bifida, not direct evidence. This is exactly the kind of gap the combined-exposure section of this document describes: the study has not been done.'},
    {d:'mental',name:'Mental / cognitive',strength:'emerging',note:'Fine particulate matter crosses into the bloodstream and is associated with neuroinflammation and cognitive effects in air pollution research generally. Deployment-related cognitive complaints are confounded by traumatic brain injury and PTSD, which makes the exposure signal difficult to isolate.'}
  ]},
];
const strengthColor={strong:'#E24B4A',moderate:'#BA7517',emerging:'#378ADD'};
const strengthLabels={strong:'Strong evidence',moderate:'Moderate evidence',emerging:'Emerging / limited'};
const svg2=document.getElementById('exp');
const tabs2=document.getElementById('tabs2');
const mechDiv=document.getElementById('mech-desc');
const ns='http://www.w3.org/2000/svg';
function makeOperable2(el,label,activate){
  el.setAttribute('tabindex','0');
  el.setAttribute('role','button');
  el.setAttribute('aria-label',label);
  el.addEventListener('click',activate);
  el.addEventListener('keydown',ev=>{
    if(ev.key==='Enter'||ev.key===' '||ev.key==='Spacebar'){ev.preventDefault();activate();}
  });
}
exposures.forEach(exp=>{
  const btn=document.createElement('button');btn.textContent=exp.short;
  btn.addEventListener('click',()=>showExposure(exp.id));tabs2.appendChild(btn);
});
function showExposure(id){
  const exp=exposures.find(e=>e.id===id);
  tabs2.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('active',exposures[i].id===id));
  while(svg2.children.length>1)svg2.removeChild(svg2.lastChild);
  mechDiv.innerHTML='<b>Mechanism:</b> '+exp.mechanism;
  const centerY=220;
  const srcR=document.createElementNS(ns,'rect');
  srcR.setAttribute('x',20);srcR.setAttribute('y',centerY-30);srcR.setAttribute('width',240);srcR.setAttribute('height',60);
  srcR.setAttribute('rx',8);srcR.setAttribute('fill','#E24B4A');srcR.setAttribute('opacity','0.15');
  srcR.setAttribute('stroke','#E24B4A');srcR.setAttribute('stroke-width','1');svg2.appendChild(srcR);
  const srcT=document.createElementNS(ns,'text');srcT.setAttribute('x',140);srcT.setAttribute('y',centerY);
  srcT.setAttribute('text-anchor','middle');srcT.setAttribute('dominant-baseline','central');
  srcT.setAttribute('fill','var(--text-primary)');srcT.setAttribute('font-size','11px');srcT.setAttribute('font-weight','500');
  srcT.setAttribute('font-family','var(--font)');srcT.textContent=exp.short;svg2.appendChild(srcT);
  const targets=exp.targets;const startY=30;const gapY=Math.min(50,400/targets.length);const targetX=440;
  targets.forEach((t,i)=>{
    const ty=startY+i*gapY+gapY/2;
    const line=document.createElementNS(ns,'path');const midX=320;
    line.setAttribute('d',`M260 ${centerY} C${midX} ${centerY} ${midX} ${ty} ${targetX-10} ${ty}`);
    line.setAttribute('fill','none');line.setAttribute('stroke',strengthColor[t.strength]);
    line.setAttribute('stroke-width',t.strength==='strong'?'2':t.strength==='moderate'?'1.2':'0.8');
    line.setAttribute('opacity',t.strength==='strong'?'0.6':t.strength==='moderate'?'0.4':'0.25');
    line.setAttribute('marker-end','url(#arrow2)');line.style.cursor='pointer';
    // Dash pattern carries evidence strength alongside colour and weight, so the
    // encoding survives colour-blindness and greyscale printing.
    if(t.strength==='emerging')line.setAttribute('stroke-dasharray','3 4');
    else if(t.strength==='moderate')line.setAttribute('stroke-dasharray','9 4');
    line.style.transition='opacity 0.15s, stroke-width 0.15s';
    const show=()=>{document.getElementById('info2').innerHTML=`<b>${exp.short} and ${t.name}</b> <span class="strength str-${t.strength}">${strengthLabels[t.strength]}</span><br>${t.note}`;};
    const up=()=>{line.setAttribute('opacity','0.9');line.setAttribute('stroke-width','2.5');};
    const down=()=>{line.setAttribute('opacity',t.strength==='strong'?'0.6':t.strength==='moderate'?'0.4':'0.25');line.setAttribute('stroke-width',t.strength==='strong'?'2':t.strength==='moderate'?'1.2':'0.8');};
    line.addEventListener('mouseenter',up); line.addEventListener('focus',up);
    line.addEventListener('mouseleave',down); line.addEventListener('blur',down);
    makeOperable2(line, `${exp.short} and ${t.name}: ${strengthLabels[t.strength]}`, show);
    svg2.appendChild(line);
    const tg=document.createElementNS(ns,'g');tg.style.cursor='pointer';
    makeOperable2(tg, `${t.name}: evidence from ${exp.short}`, show);
    const dot=document.createElementNS(ns,'circle');dot.setAttribute('cx',targetX);dot.setAttribute('cy',ty);dot.setAttribute('r','4');
    dot.setAttribute('fill',strengthColor[t.strength]);dot.setAttribute('opacity','0.6');tg.appendChild(dot);
    const label=document.createElementNS(ns,'text');label.setAttribute('x',targetX+12);label.setAttribute('y',ty);
    label.setAttribute('dominant-baseline','central');label.setAttribute('fill','var(--text-primary)');
    label.setAttribute('font-size','12px');label.setAttribute('font-family','var(--font)');label.textContent=t.name;tg.appendChild(label);
    svg2.appendChild(tg);
  });
}
showExposure('ao');
})();
