import React, { useState, ChangeEvent } from 'react';

interface Vec3 {
    x: number;
    y: number;
    z: number;
}

interface RotationControlsProps {
    rotation: Vec3;
    setRotation: Dispatch<SetStateAction<Vec3>>
    resetClick: ()=>void;
}

const RotationControls: React.FC<RotationControlsProps> = (props) => {

    const rotation = props.rotation;
    const setRotation = props.setRotation;
    const resetClick = props.resetClick;
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    const handleSliderChange = (axis: 'x' | 'y' | 'z') => (event: ChangeEvent<HTMLInputElement>) => {
        // create copy, set value, trigger event
        const newRotation = { ...rotation }; 
        newRotation[axis] = parseFloat(event.target.value);
        setRotation(newRotation);
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`rotation-controls ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="header" onClick={toggleCollapse}>
                <h4 id="ControlsHeader">Controls</h4>
                <span className="carot">{isCollapsed ? '▲' : '▼'}</span>
            </div>
            <div className="controls-content">
                <div className="control">
                    <label htmlFor="x-axis">phi: {180-rotation.x}°</label>
                    <input
                        type="range"
                        id="x-axis"
                        min="100"
                        max="180"
                        step="5"
                        value={rotation.x}
                        onChange={handleSliderChange('x')}
                    />
                </div>
                {/* <div className="control">
                    <label htmlFor="y-axis">y-axis: {rotation.y}°</label>
                    <input
                        type="range"
                        id="y-axis"
                        min="-180"
                        max="180"
                        step="5"
                        value={rotation.y}
                        onChange={handleSliderChange('y')}
                    />
                </div> */}
                <div className="control">
                    <label htmlFor="z-axis">theta: {rotation.z}°</label>
                    <input
                        type="range"
                        id="z-axis"
                        min="-180"
                        max="180"
                        step="5"
                        value={rotation.z}
                        onChange={handleSliderChange('z')}
                    />
                </div>
                {/* <div className="control">
                    <button type="button" onClick={resetClick()}>RESET</button>
                </div> */}
            </div>
        </div>
    );
};

export default RotationControls;