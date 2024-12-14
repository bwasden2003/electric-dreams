export const terrainVSText = `
    precision mediump float;
    
    attribute vec4 vertPosition;
    attribute vec4 normal;
		
    varying vec4 norms;

    uniform mat4 mProj;
    uniform mat4 mView;

    void main() {

        gl_Position = mProj * mView * vertPosition;
        norms = normal;
    }
`;

export const terrainFSText = `
    precision mediump float;

    varying vec4 norms;

    uniform vec2 mousePosition;

    uniform vec3 lightDirection;

    uniform float hue;

    float hueToRgb(float p, float q, float t) {
        if (t < 0.0){
            t += 1.0;
        }
        if (t > 1.0) {
            t -= 1.0;
        }
        if (t < 1.0/6.0) {
            return p + (q - p) * 6.0 * t;
        }
        if (t < 1.0/2.0) {
            return q;
        }
        if (t < 2.0/3.0) {
            return p + (q - p) * (2.0/3.0 - t) * 6.0;
        }
        return p;
    }

    vec3 hslToRgb(float h, float s, float l) {
        float r = 0.0;
        float g = 0.0;
        float b = 0.0;
        if (s == 0.0) {
            r = l;
            g = l;
            b = l;
        } else {
            float q = 0.0;
            if (l < 0.5) {
                q = l * (1.0 + s);
            } else {
                q = l + s - l * s;
            }
            float p = 2.0 * l - q;
            r = hueToRgb(p, q, h + 1.0/3.0);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1.0/3.0); 
        }

        return vec3(r, g, b);
    }

    void main() {
        vec3 norm = normalize(norms.xyz);
        vec3 lightDirNorm = normalize(lightDirection.xyz);
        float diff = max(dot(norm, lightDirNorm), 0.0);

        float saturation = mousePosition.x;

        float lightness = 0.5 + 0.5 * mousePosition.y;

        vec3 adjustedColor = hslToRgb(hue / 360.0, saturation, lightness);

        gl_FragColor = vec4(adjustedColor * diff, 1.0);

        // not sure how I want the green to change tbh ^
    }
`;

export const realisticTerrainVSText = `
    precision mediump float;
    
    attribute vec4 vertPosition;
    attribute vec4 normal;

    varying vec4 posShader;
    varying vec4 norms;

    uniform mat4 mProj;
    uniform mat4 mView;

    void main() {

        gl_Position = mProj * mView * vertPosition;
        norms = normal;
        posShader = gl_Position;
    }
`;

export const realisticTerrainFSText = `
    precision mediump float;

    uniform mat4 mProjInv;
    uniform mat4 mViewInv;

    varying vec4 posShader;
    varying vec4 norms;

    uniform vec3 lightDirection;

    void main() {

        vec3 norm = normalize(norms.xyz);
        vec3 lightDirNorm = normalize(lightDirection.xyz);
        float diff = max(dot(norm, lightDirNorm), 0.0);

        vec4 worldSpacePos = mViewInv * mProjInv * vec4(posShader.xyz/posShader.w, 1.0);
        worldSpacePos /= worldSpacePos.w;

        float height = 1.0;
        float value = floor(worldSpacePos.y/1.0);

        vec3 color = vec3(abs(norms.x), abs(norms.y), abs(norms.z));
        
        if (value > 0.0 && !(value < 0.0))
        {   
            // brown terrain
            color = vec3(1.0, clamp(abs(norms.y), 0.4, 0.65), 0.47254903);
        }
        else if(value > -0.50)
        {
            // green terrain
            color = vec3(0.37254903, clamp(abs(norms.y), 2.0, 1.00),  0.5294118);
        }
        else 
        {
            // blue terrain
            color = vec3(0.0, 0.05, clamp(abs(norms.z), 0.20, 1.00));
        }
        gl_FragColor = vec4(color * diff, 1.0);

    }
`;

export const sunVSText = `
    precision mediump float;
    
    attribute vec4 vertPosition;

    uniform mat4 mProj;
    uniform mat4 mView;
    void main() {
        gl_Position = mProj * mView * vertPosition;
    }
`;

export const sunFSText = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
    }
`;
// Vertex shader
export const cylinderVSText = `
precision mediump float;

attribute vec3 vertPosition;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main () {
    gl_Position = mProj * mView * vec4(vertPosition, 1.0);
}
`;

export const cylinderFSText = `
precision mediump float;

void main () {
    gl_FragColor = vec4(1.0, 0.85, 0.15, 1.0);
}
`;