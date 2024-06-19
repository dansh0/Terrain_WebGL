import React, { useState, ChangeEvent } from 'react';

interface Vec3 {
    x: number;
    y: number;
    z: number;
}

interface RotationControlsProps {
    onChange: (rotation: Vec3) => void;
}

const RotationControls: React.FC<RotationControlsProps> = ({ onChange }) => {
    const [rotation, setRotation] = useState<Vec3>({ x: 0, y: 0, z: 0 });

    const handleSliderChange = (axis: 'x' | 'y' | 'z') => (event: ChangeEvent<HTMLInputElement>) => {
        const newRotation = {
            ...rotation,
            [axis]: parseFloat(event.target.value)
        };
        setRotation(newRotation);
        onChange(newRotation);
    };

    return (
        <div className="rotation-controls">
            <h2>3D Rotation Controls</h2>
            <div className="control">
                <label htmlFor="x-rotation">X Rotation: {rotation.x}°</label>
                <input
                    type="range"
                    id="x-rotation"
                    min="-180"
                    max="180"
                    step="1"
                    value={rotation.x}
                    onChange={handleSliderChange('x')}
                />
            </div>
            <div className="control">
                <label htmlFor="y-rotation">Y Rotation: {rotation.y}°</label>
                <input
                    type="range"
                    id="y-rotation"
                    min="-180"
                    max="180"
                    step="1"
                    value={rotation.y}
                    onChange={handleSliderChange('y')}
                />
            </div>
            <div className="control">
                <label htmlFor="z-rotation">Z Rotation: {rotation.z}°</label>
                <input
                    type="range"
                    id="z-rotation"
                    min="-180"
                    max="180"
                    step="1"
                    value={rotation.z}
                    onChange={handleSliderChange('z')}
                />
            </div>
        </div>
    );
};

export default RotationControls;