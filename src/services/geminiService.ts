import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  try {
    return import.meta.env?.VITE_GEMINI_API_KEY || "dummy_api_key_to_bypass_error";
  } catch {
    return "dummy_api_key_to_bypass_error";
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export async function generateCharacterJSON(
  referenceImageBase64: string,
  referenceImageMimeType: string,
  faceImageBase64?: string,
  faceImageMimeType?: string,
  gender?: string,
  nationality?: string
) {
  const prompt = `
# ROLE & OBJECTIVE
You are a Technical Visual Analyst specializing in Image-to-Image generation workflows
(ControlNet/IP-Adapter).
**YOUR GOAL:** Analyze the input image to create a perfect "container" description
(Background, Lighting, Outfit, Pose) that allows the user to insert their own character
seamlessly.
**CRITICAL INSTRUCTION:**
- **DO NOT** focus on the source subject's identity (hair color, specific facial features,
ethnicity). The user will replace the face and hair with their own reference.
- **DO** focus heavily on the Pose, Camera Angle, Clothing Details, Environmental context,
and Lighting physics.
- The target character will be a ${gender || 'person'} from ${nationality || 'any country'}.

# INPUT
- The source reference image for pose and background is provided.
${faceImageBase64 ? '- An optional face reference image is also provided for context, but remember to focus on the container (pose/background) from the main reference image.' : ''}

# OUTPUT FORMAT
- Return **ONLY** a single valid JSON object, Markdown Fenced Code Block
- **NO** markdown formatting outside the code block.
- **NO** commentary.

# JSON SCHEMA
\`\`\`json
{
"metadata": {
"confidence_score": "high/medium/low - assessment of analysis accuracy",
"image_type": "photograph/digital art/illustration/graphic design/mixed media",
"primary_purpose": "marketing/editorial/social media/product/portrait/landscape/abstract"
},
"composition": {
"rule_applied": "rule of thirds/golden ratio/center composition/symmetry/asymmetry",
"aspect_ratio": "width:height ratio or format description",
"layout": "grid/single subject/multi-element/layered",
"focal_points": [
"Primary focal point location and element",
"Secondary focal point if present"
],
"visual_hierarchy": "Description of how eye moves through the image",
"balance": "symmetric/asymmetric/radial - with description"
},
"color_profile": {
"dominant_colors": [
{
"color": "Specific color name",
"hex": "#000000",
"percentage": "approximate percentage of image",
"role": "background/accent/primary subject"
}
],
"color_palette": "complementary/analogous/triadic/monochromatic/split-complementary",
"temperature": "warm/cool/neutral - overall feeling",
"saturation": "highly saturated/moderate/desaturated/black and white",
"contrast": "high contrast/medium contrast/low contrast/soft"
},
"lighting": {
"type": "natural window/artificial/mixed/studio/practical lights",
"source_count": "single source/multiple sources - number and placement",
"direction": "front/45-degree side/90-degree side/back/top/bottom/diffused from above",
"directionality": "highly directional/moderately directional/diffused/omni-directional",
"quality": "hard light/soft light/dramatic/even/gradient/sculpted",
"intensity": "bright/moderate/low/moody/high-key/low-key",
"contrast_ratio": "high contrast (dramatic shadows)/medium contrast/low contrast (flat)",
"mood": "cheerful/dramatic/mysterious/calm/energetic/professional/casual",
"shadows": {
"type": "harsh defined edges/soft gradual edges/minimal/dramatic/absent",
"density": "deep black/gray/transparent/faint",
"placement": "under subject/on wall/from objects/cast patterns",
"length": "short/medium/long - shadow projection distance"
},
"highlights": {
"treatment": "blown out/preserved/subtle/dramatic/specular",
"placement": "on face/hair/clothing/background - where light hits strongest"
},
"ambient_fill": "present/absent - secondary fill light reducing shadows",
"light_temperature": "warm (golden)/neutral/cool (blue) - color cast"
},
"technical_specs": {
"medium": "digital photography/3D render/digital painting/vector/photo manipulation/mixed",
"style": "realistic/hyperrealistic/stylized/minimalist/maximalist/abstract/surreal",
"texture": "smooth/grainy/sharp/soft/painterly/glossy/matte",
"sharpness": "tack sharp/slightly soft/deliberately soft/bokeh effect",
"grain": "none/film grain/digital noise/intentional grain - level",
"depth_of_field": "shallow/medium/deep - with subject isolation description",
"perspective": "straight on/low angle/high angle/dutch angle/isometric/one-point/two-point"
},
"artistic_elements": {
"genre": "portrait/landscape/abstract/conceptual/commercial/editorial/street/fine art",
"influences": [
"Identified artistic movement, photographer, or style influence"
],
"mood": "energetic/calm/dramatic/playful/sophisticated/raw/polished",
"atmosphere": "Description of overall feeling and emotional impact",
"visual_style": "clean/cluttered/minimal/busy/organic/geometric/fluid/structured"
},
"typography": {
"present": "true/false",
"fonts": [
{
"type": "sans-serif/serif/script/display/handwritten",
"weight": "thin/light/regular/medium/bold/black",
"characteristics": "modern/vintage/playful/serious/technical"
}
],
"placement": "overlay/integrated/border/corner - with strategic description",
"integration": "subtle/prominent/dominant/background"
},
"subject_analysis": {
"primary_subject": "Main subject description",
"positioning": "center/left/right/top/bottom/rule of thirds placement",
"scale": "close-up/medium/full/environmental/macro",
"interaction": "isolated/interacting with environment/multiple subjects",
"facial_expression": {
"mouth": "closed smile/open smile/slight smile/neutral/serious/pursed - exact mouth position",
"smile_intensity": "no smile/subtle/moderate/broad/wide - degree of smile",
"eyes": "direct gaze/looking away/squinting/wide/relaxed/intense - eye expression",
"eyebrows": "raised/neutral/furrowed/relaxed - brow position",
"overall_emotion": "happy/content/serious/playful/confident/approachable/guarded/warm/cold",
"authenticity": "genuine/posed/candid/formal/natural"
},
"hair": {
"length": "pixie/short/chin-length/shoulder-length/mid-back/long/very long - specific measurement",
"cut": "blunt/layered/shaggy/undercut/fade/tapered/disconnected - exact style name",
"texture": "straight/wavy/curly/coily/kinky - natural pattern with specific wave type (loose waves/tight curls/s-waves)",
"texture_quality": "smooth/coarse/fine/thick/thin - hair strand thickness",
"natural_imperfections": "flyaways/frizz/uneven sections/growth patterns/cowlicks - observable natural variation",
"styling": "sleek/tousled/wet look/blow-dried/natural/product-heavy/messy/textured - exact current state",
"styling_detail": "Degree of styling: heavily styled/lightly styled/unstyled, product visibility, movement quality",
"part": "center/side/deep side/no part/zigzag - exact location with precision",
"volume": "flat/moderate volume/voluminous - root lift and overall fullness",
"details": "Specific features: bangs type, face-framing layers, buzzed sections, faded areas, length variations, texture inconsistencies"
},
"hands_and_gestures": {
"left_hand": "Exact position and gesture - touching face/holding object/resting on surface/in pocket/behind back/clasped/visible or not visible",
"right_hand": "Exact position and gesture - touching face/holding object/resting on surface/in pocket/behind back/clasped/visible or not visible",
"finger_positions": "Specific details: pointing/peace sign/thumbs up/relaxed/gripping/spread/interlaced/curled",
"finger_interlacing": "if hands clasped: natural loose interlacing/tight formal interlacing/fingers overlapping/thumbs position",
"hand_tension": "relaxed/tense/natural/posed/rigid - muscle tension observable",
"interaction": "What hands are doing: holding phone/touching hair/on hip/crossed/clasped at waist/clasped at chest/gesturing",
"naturalness": "organic casual gesture/deliberately posed/caught mid-motion/static formal pose"
},
"body_positioning": {
"posture": "standing/sitting/leaning/lying - exact position",
"angle": "facing camera/45 degree turn/profile/back to camera",
"weight_distribution": "leaning left/right/centered/shifted",
"shoulders": "level/tilted/rotated/hunched/back"
}
},
"background": {
"setting_type": "indoor/outdoor/studio/natural environment - specific location",
"spatial_depth": "shallow/medium/deep - layers description",
"elements_detailed": [
{
"item": "Specific object name (if plant: species like monstera/pothos/bird of paradise/fern)",
"position": "left/right/center/top/bottom - exact placement with quadrant",
"distance": "foreground/midground/background",
"size": "dominant/medium/small - relative scale and proportion",
"condition": "new/worn/vintage/pristine/wilted/thriving - state description",
"specific_features": "For plants: flower color, leaf pattern, pot type; For objects: brand, wear, details"
}
],
"wall_surface": {
"material": "painted drywall/concrete/brick/wood paneling/tile/wallpaper/plaster - exact base material",
"surface_treatment": "smooth paint/textured paint/raw concrete/polished concrete/exposed brick/finished/unfinished",
"texture": "perfectly smooth/slightly textured/rough/patterned/brushed - tactile quality",
"finish": "matte/satin/glossy/flat - sheen level",
"color": "Specific color with undertones (e.g., warm gray, cool blue-gray, off-white)",
"color_variation": "uniform/gradient/patchy/streaked - color consistency",
"features": "clean/water stains/vertical streaks/horizontal marks/cracks/patches/fixtures/artwork/scuffs - ALL observable surface details",
"wear_indicators": "pristine/aged/weathered/industrial/residential - condition and style"
},
"floor_surface": {
"material": "wood/tile/carpet/concrete/grass - exact type",
"color": "Specific color",
"pattern": "solid/checkered/striped/herringbone - if present"
},
"objects_catalog": "List every visible object with position: furniture pieces, decorative items, functional objects, natural elements",
"background_treatment": "blurred/sharp/minimal/detailed/gradient/textured"
},
"generation_parameters": {
"prompts": [
"Detailed technical prompt for recreating this style",
"Alternative angle or variation prompt"
],
"keywords": [
"keyword1",
"keyword2",
"keyword3",
"keyword4",
"keyword5"
],
"technical_settings": "Recommended camera/render settings description for recreation",
"post_processing": "Color grading, filters, or editing techniques applied"
}
}
\`\`\`
`;

  const parts: any[] = [
    { text: prompt },
    {
      inlineData: {
        data: referenceImageBase64,
        mimeType: referenceImageMimeType,
      },
    },
  ];

  if (faceImageBase64 && faceImageMimeType) {
    parts.push({
      inlineData: {
        data: faceImageBase64,
        mimeType: faceImageMimeType,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
    },
  });

  return response.text;
}

export async function generateStoryboard(
  isAffiliate: boolean,
  productImageBase64: string | undefined,
  productImageMimeType: string | undefined,
  productDesc: string,
  affiliateType: string,
  characterImageBase64: string,
  characterImageMimeType: string,
  characterName: string,
  durationSeconds: number,
  storyIdea: string
) {
  const prompt = `
You are an expert AI Video Prompt Engineer and Storyboard Creator.
Your task is to create a storyboard for a short video based on the provided inputs.

Inputs:
- Content Type: ${isAffiliate ? 'Affiliate' : 'Non-Affiliate'}
${isAffiliate ? `- Product Description: ${productDesc}` : ''}
${isAffiliate ? `- Affiliate Strategy: ${affiliateType} (Structure: Hook-Isi-CTA+Fomo)` : ''}
- Character Name: ${characterName}
- Duration: ${durationSeconds} seconds
- Story Idea: ${storyIdea || 'Generate a creative story based on the inputs.'}

You will be provided with a Character Image (this is [IMAGE REFERENCE 1])${isAffiliate && productImageBase64 ? ' and a Product Image (this is [IMAGE REFERENCE 2])' : ''}.

Output Format:
Generate a sequence of PROMPT IMAGE and PROMPT VIDEO instructions.
The output MUST strictly follow this exact structure and style, adapted to the specific inputs.
Do not add any conversational text before or after the storyboard.
Use Markdown formatting.

Example 1 (60 seconds, Affiliate Baju Koko, Character: Om Broto):
PROMPT IMAGE 1 : PEGANG BAJU
A hyper-realistic vertical vlog snapshot (9:16 aspect ratio) captured on a smartphone.
The Indonesian content creator, whose facial features and exact body shape must be
rigorously maintained from [IMAGE REFERENCE 1], is facing the camera with a
relaxed, natural expression. They are in a simple bedroom studio, holding up the specific
shirt on a hanger derived exactly from [IMAGE REFERENCE 2] while reviewing it. The
lighting is soft and mixed, combining natural daylight from a window with warm ambient
room lights. Casual outfit, authentic skin texture, handheld camera feel, high fidelity.

PROMPT IMAGE 2 : TIDAK PEGANG BAJU
The character from the reference image is standing with empty, relaxed hands at their
sides.

PROMPT IMAGE 3 : GANTI BAJU
The character is wearing the exact outfit from the reference image, maintaining a 100%
identical shape and model.

PROMPT IMAGE 4 VARIASI SHOT 1
- Close-up Detail Kerah & Kancing: "A detailed close-up shot focusing on the
white linen mandarin collar and the front placket of the shirt from this image.
Show the texture of the linen fabric, the wooden buttons, and the stitching. The
man's beard and the top of his chest are visible."

PROMPT VIDEO 1 (START FRAME IMAGE 1 TO END FRAME IMAGE 2)
The man lifts up a white shirt on a hanger to show it to the camera, He looks directly at
the lens and speaks in Bahasa Indonesia: "Halo gaes, om broto ada rekomendasi baju
koko nih buat kalian yang simple dan enak baget dipake buat terawih besok"

PROMPT VIDEO 2 
A man walks back into the frame from the left side. He looks at the camera, showing off
the fit, and speaks in Bahasa Indonesia: "Nih udah om coba, Wih, mantap! Adem,
nyaman, auto khusyuk nih tarawihnya nanti, Rapi, pas, gak gombrong. Asli keren."

PROMPT VIDEO 3 
The man turns slowly from a front view to a side profile view to demonstrate the fit of the
shirt. The movement is steady and professional. The fabric texture is visible. He speaks
in Bahasa naturally while turning "Buat yang tanya fitting-nya gimana, nih liat. Depan
oke, sampingnya juga ngebentuk badan tapi nggak maksa. Solid sih ini buat harian
juga.".

PROMPT VIDEO 4
A cinematic close-up pan shot of a man wearing a white textured linen shirt. The video
starts focused on the short sleeve with a grey cuff detail. The camera slowly pans to the
right across the torso, ending focused on the chest area to reveal the buttons and the
mandarin collar. The man speaks in bahasa "Dari detail lengan yang beda warna,
sampai ke potongan kerah yang simpel. Ini definisi baju yang effortless. Dipake
langsung ganteng."

PROMPT VIDEO 5 
The man looks directly at the camera with a confident, slight smile. He makes a natural,
stylish gesture by gently adjusting the collar with one hand, then smoothing down the
button placket on his chest. The movement is smooth and confident, showcasing the
shirt's fit. The man speaks in Bahasa Indonesia: "Buat yang mau tampil clean kayak gini,
om broto udah taruh link-nya. Cek keranjang kuning di bawah, mumpung masih ada."


Example 2 (30 seconds, Affiliate Hampers Mangkok Lebaran, Character: Perempuan Muda):
PROMPT IMAGE 1 PEGANG BOX
A hyper-realistic vertical vlog snapshot (9:16 aspect ratio) captured on a smartphone.
The Indonesian content creator, whose facial features and exact body shape must be
rigorously maintained from [IMAGE REFERENCE 1], is facing the camera with a
relaxed, natural expression. They are in a simple bedroom studio, holding up the specific
box derived exactly from [IMAGE REFERENCE 2] while reviewing it. The lighting is soft
and mixed, combining natural daylight from a window with warm ambient room lights.
Casual outfit, authentic skin texture, handheld camera feel, high fidelity.

PROMPT IMAGE 2 TIDAK PEGANG BARANG
The character from the reference image is sitting with empty, relaxed hands at their
sides.

PROMPT IMAGE 3 PEGANG Bowl + Chopstick
A hyper-realistic vertical vlog snapshot (9:16 aspect ratio) captured on a smartphone.
The Indonesian content creator, whose facial features and exact body shape must be
rigorously maintained from this image, is facing the camera with a relaxed, natural
expression. They are in a simple bedroom studio, holding up the small bowl derived
exactly and black chopstick from [IMAGE REFERENCE] while reviewing it. The lighting
is soft and mixed, combining natural daylight from a window with warm ambient room
lights. Casual outfit, authentic skin texture, handheld camera feel, high fidelity.

PROMPT VIDEO 1 (START FRAME IMAGE 1 TO END FRAME IMAGE 2)
A young woman with a short black bob haircut sitting on a wooden stool in a cozy
modern bedroom; initially her hands are empty by her sides, then she leans forward to
pick up a decorative green rectangular Lebaran hamper box from the floor near her feet
and brings it up to her chest with both hands while smiling warmly at the camera, saying
in Indonesian: "Kalian lagi pusing cari hampers Lebaran yang murah tapi kelihatan
mahal? Aku nemu set mangkok cantik yang harganya cuma 20 ribuan aja, lho!"

PROMPT VIDEO 2 :
she is initially holding a green decorative Eid hamper box, then she leans forward to
reveal and pick up an elegant ceramic bowl and a pair of chopsticks from the package,
holding them up toward the camera with a bright smile while saying in Indonesian:
"Packaging-nya super estetik, dan di dalam satu boks ini kalian udah langsung dapet
dua mangkok elegan plus sepasang sumpit."

PROMPT VIDEO 3 :
A cinematic close-up shot of a hand holding a high-quality ceramic bowl with a beautiful
blue, white, and orange intricate motif; the camera focuses on the thick, durable rim and
the premium glossy finish of the bowl as a dark wooden chopstick is shown touching the
side to emphasize its quality, while the woman says in Indonesian: "Material
mangkoknya tebal, awet, dan motifnya mewah banget, jadi kita dijamin nggak bakal
malu-maluin buat ngasih hampers ini ke orang terdekat."

PROMPT VIDEO 4 :
A young woman with a short black bob haircut and a denim jacket is sitting in a cozy
bedroom, holding a decorative green Eid hamper box with both hands; she then leans in
close toward the camera, bringing the box forward to showcase its design and details
clearly to the viewer, with a friendly and persuasive expression, while saying in
Indonesian: "Mumpung stoknya masih aman dan sebelum harganya naik, yuk langsung
aja checkout paket hampers kece ini di keranjang kuning sekarang juga!"

Ensure the number of scenes fits the requested duration (${durationSeconds} seconds).
Generally, 1 video prompt = ~5-10 seconds of video.
The video prompts should include the character's actions and the spoken dialogue in Bahasa Indonesia.
If it's an affiliate video, ensure the dialogue follows the Hook-Isi-CTA+Fomo structure.
`;

  const parts: any[] = [
    { text: prompt },
    {
      inlineData: {
        data: characterImageBase64,
        mimeType: characterImageMimeType,
      },
    },
  ];

  if (isAffiliate && productImageBase64 && productImageMimeType) {
    parts.push({
      inlineData: {
        data: productImageBase64,
        mimeType: productImageMimeType,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts },
  });

  return response.text;
}

export async function generateImageFromPrompt(
  promptText: string,
  referenceImageBase64?: string,
  referenceImageMimeType?: string
) {
  // Use Pollinations.ai — free image generation, no API key needed
  // We return the URL directly and let the browser load it (can take 30-90 seconds)
  const cleanPrompt = `${promptText} vertical portrait 9:16 cinematic high quality`;
  const encodedPrompt = encodeURIComponent(cleanPrompt);
  const seed = Math.floor(Math.random() * 1000000);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=576&height=1024&seed=${seed}&model=flux-schnell&nologo=true`;

  return imageUrl;
}




