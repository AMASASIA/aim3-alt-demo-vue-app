/**
 * MINT Deployment Agent
 * 
 * Extends the basic MINT topology to handle complex generation tasks (Image, Video, Code).
 */
const { GoogleGenerativeAI } = require("@google/generative-ai");

class MintDeploymentAgent {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async executeWorkflow(inputData, workflowDef) {
        const context = { inputs: inputData, steps: {} };
        const trace = [];

        try {
            // Step 1: Synthesize Context (ProcessNode)
            const synthesisNode = workflowDef.nodes.find(n => n.id === 'step_synthesize_context');
            console.log(`[Deployment Agent] Synthesizing Project Context...`);

            const synthesisPrompt = `
                System: ${synthesisNode.config.systemInstruction}
                Input Data: ${JSON.stringify(inputData)}
                Output Format: JSON { "projectName": string, "tagline": string, "description": string, "features": string[] }
            `;
            const synthesisResult = await this.generateText(synthesisPrompt);
            context.project_context = JSON.parse(this.cleanJson(synthesisResult));
            trace.push({ step: 'synthesis', status: 'completed', output: context.project_context });


            // Step 2 & 3: Parallel Media Generation (MediaNode)
            // In a real MINT, we'd use external APIs (Imagen/Runway)
            console.log(`[Deployment Agent] Generating Media Assets...`);

            const [heroImage, showcaseVideo] = await Promise.all([
                this.simulateImageGen(context.project_context),
                this.simulateVideoGen(context.project_context)
            ]);

            context.hero_image_url = heroImage;
            context.showcase_video_url = showcaseVideo;
            trace.push({ step: 'media_gen', status: 'completed', output: { image: heroImage, video: showcaseVideo } });


            // Step 4: Assemble Dashboard (AssemblyNode)
            console.log(`[Deployment Agent] Assembling Dashboard Code...`);
            const assemblyNode = workflowDef.nodes.find(n => n.id === 'step_assemble_dashboard');

            const assemblyPrompt = `
                System: Construct a modern HTML landing page structure. Use Tailwind CSS classes.
                Project: ${JSON.stringify(context.project_context)}
                Hero Image: ${context.hero_image_url}
                Video: ${context.showcase_video_url}
                Output: Pure HTML string inside a div container.
            `;
            const dashboardHtml = await this.generateText(assemblyPrompt);
            context.dashboard_html = this.cleanHtml(dashboardHtml);

            trace.push({ step: 'assembly', status: 'completed' });

            return {
                context,
                trace
            };

        } catch (error) {
            console.error("Deployment Generation Failed:", error);
            throw error;
        }
    }

    async generateText(prompt) {
        const result = await this.model.generateContent(prompt);
        return result.response.text();
    }

    async simulateImageGen(context) {
        // Placeholder for DALL-E or Imagen API call
        // Using dynamic placeholder service
        const query = encodeURIComponent(context.tagline.substring(0, 20));
        return `https://dummyimage.com/1200x600/000/fff.jpg&text=${query}+Hero+Image`;
    }

    async simulateVideoGen(context) {
        // Placeholder for Runway API
        // Returning a generic tech background video
        return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"; // Using a sample video for demo
    }

    cleanJson(text) {
        return text.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    cleanHtml(text) {
        return text.replace(/```html/g, '').replace(/```/g, '').trim();
    }
}

module.exports = MintDeploymentAgent;
