'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Circle, Line, Text, Group, Ring } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Device, Link, Topology } from '@/types';
import { useSimulationStore } from '@/store/simulationStore';

// ============================================
// Device Visual Config
// ============================================

const DEVICE_COLORS = {
  normal: '#10b981',       // green-500
  under_attack: '#f59e0b', // amber-500
  compromised: '#ef4444',  // red-500
  isolated: '#6b7280',     // gray-500
};

const DEVICE_TYPE_ICONS: Record<Device['type'], string> = {
  router: '🌐',
  switch: '🔀',
  host: '💻',
  firewall: '🛡️',
  server: '🖥️',
};

// ============================================
// Device Node Component
// ============================================

interface DeviceNodeProps {
  device: Device;
  isSelected: boolean;
  onClick: (device: Device) => void;
}

const DeviceNode: React.FC<DeviceNodeProps> = ({ device, isSelected, onClick }) => {
  const getColor = () => DEVICE_COLORS[device.status];
  const getPulse = () => device.status === 'compromised' || device.status === 'under_attack';

  return (
    <Group
      x={device.x}
      y={device.y}
      onClick={() => onClick(device)}
      onTap={() => onClick(device)}
      cursor="pointer"
    >
      {/* Selection ring */}
      {isSelected && (
        <Ring
          innerRadius={28}
          outerRadius={32}
          fill="#3b82f6"
          opacity={0.8}
        />
      )}

      {/* Pulse effect for compromised/attacked devices */}
      {getPulse() && (
        <Circle
          radius={35}
          fill={getColor()}
          opacity={0.3}
          scaleX={1.2}
          scaleY={1.2}
          shadowColor={getColor()}
          shadowBlur={20}
          shadowOpacity={0.8}
        />
      )}

      {/* Main device circle */}
      <Circle
        radius={25}
        fill={getColor()}
        stroke="#1f2937"
        strokeWidth={2}
        shadowColor="#000"
        shadowBlur={5}
        shadowOpacity={0.3}
      />

      {/* Device icon */}
      <Text
        text={DEVICE_TYPE_ICONS[device.type]}
        fontSize={20}
        x={-10}
        y={-10}
        align="center"
      />

      {/* Device name label */}
      <Text
        text={device.name}
        fontSize={11}
        fill="#e5e7eb"
        x={-50}
        y={35}
        width={100}
        align="center"
        fontFamily="monospace"
      />

      {/* IP address label */}
      <Text
        text={device.interfaces[0]?.ip || ''}
        fontSize={9}
        fill="#9ca3af"
        x={-50}
        y={48}
        width={100}
        align="center"
        fontFamily="monospace"
      />

      {/* Status indicator */}
      {device.status !== 'active' && (
        <Text
          text={device.status.toUpperCase()}
          fontSize={8}
          fill={getColor()}
          x={-50}
          y={60}
          width={100}
          align="center"
          fontFamily="monospace"
          fontStyle="bold"
        />
      )}

      {/* Vulnerability indicator */}
      {device.vulnerabilities && device.vulnerabilities.length > 0 && device.status !== 'compromised' && (
        <Circle
          radius={8}
          fill="#f59e0b"
          x={20}
          y={-20}
        />
      )}
    </Group>
  );
};

// ============================================
// Link Component
// ============================================

interface NetworkLinkProps {
  link: Link;
  devices: Device[];
  isHighlighted?: boolean;
}

const NetworkLink: React.FC<NetworkLinkProps> = ({ link, devices, isHighlighted }) => {
  const [fromDevice, fromInterface] = link.from.split('/');
  const [toDevice, toInterface] = link.to.split('/');

  const fromNode = devices.find(d => d.id === fromDevice);
  const toNode = devices.find(d => d.id === toDevice);

  if (!fromNode || !toNode) return null;

  const isCompromisedPath = 
    fromNode.status === 'compromised' || 
    toNode.status === 'compromised';

  return (
    <Line
      points={[fromNode.x, fromNode.y, toNode.x, toNode.y]}
      stroke={isHighlighted ? '#f59e0b' : isCompromisedPath ? '#ef4444' : '#4b5563'}
      strokeWidth={isHighlighted ? 3 : isCompromisedPath ? 2 : 1}
      opacity={isHighlighted ? 1 : 0.6}
      dash={isCompromisedPath ? [5, 5] : undefined}
    />
  );
};

// ============================================
// Attack Spread Animation
// ============================================

interface AttackSpreadProps {
  x: number;
  y: number;
  isActive: boolean;
}

const AttackSpread: React.FC<AttackSpreadProps> = ({ x, y, isActive }) => {
  if (!isActive) return null;

  return (
    <Circle
      x={x}
      y={y}
      radius={40}
      fill="#ef4444"
      opacity={0.2}
      scaleX={1.5}
      scaleY={1.5}
    />
  );
};

// ============================================
// Main Network Canvas Component
// ============================================

interface NetworkCanvasProps {
  width?: number;
  height?: number;
}

export const NetworkCanvas: React.FC<NetworkCanvasProps> = ({ 
  width = 800, 
  height = 600 
}) => {
  const { state, selectedDeviceId, selectDevice } = useSimulationStore();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDeviceClick = useCallback((device: Device) => {
    selectDevice(selectedDeviceId === device.id ? null : device.id);
  }, [selectedDeviceId, selectDevice]);

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;
    const clampedScale = Math.max(0.5, Math.min(3, newScale));

    setScale(clampedScale);
    setPosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  };

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    setPosition({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  if (!state) {
    return (
      <div 
        ref={containerRef}
        className="flex items-center justify-center bg-gray-900 rounded-lg"
        style={{ width, height }}
      >
        <p className="text-gray-400">No simulation running</p>
      </div>
    );
  }

  const { topology } = state;

  return (
    <div 
      ref={containerRef}
      className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700"
      style={{ width, height }}
    >
      <Stage
        width={width}
        height={height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onWheel={handleWheel}
        onDragMove={handleDragMove}
      >
        {/* Topology Layer */}
        <Layer>
          {/* Links */}
          {topology.links.map(link => (
            <NetworkLink
              key={link.id}
              link={link}
              devices={topology.devices}
            />
          ))}
        </Layer>

        {/* Attack Layer */}
        <Layer>
          {topology.devices
            .filter(d => d.status === 'compromised')
            .map(device => (
              <AttackSpread
                key={`attack-${device.id}`}
                x={device.x}
                y={device.y}
                isActive={true}
              />
            ))}
        </Layer>

        {/* Device Layer */}
        <Layer>
          {topology.devices.map(device => (
            <DeviceNode
              key={device.id}
              device={device}
              isSelected={selectedDeviceId === device.id}
              onClick={handleDeviceClick}
            />
          ))}
        </Layer>
      </Stage>

      {/* Canvas Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => setScale(s => Math.min(3, s * 1.2))}
          className="bg-gray-800 text-white p-2 rounded hover:bg-gray-700"
        >
          +
        </button>
        <button
          onClick={() => setScale(s => Math.max(0.5, s * 0.8))}
          className="bg-gray-800 text-white p-2 rounded hover:bg-gray-700"
        >
          -
        </button>
        <button
          onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}
          className="bg-gray-800 text-white px-3 py-2 rounded hover:bg-gray-700 text-sm"
        >
          Reset
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-gray-800/90 p-3 rounded-lg border border-gray-700">
        <h4 className="text-xs font-bold text-gray-300 mb-2">LEGEND</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-300">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-gray-300">Under Attack</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-300">Compromised</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span className="text-gray-300">Isolated</span>
          </div>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute top-4 right-4 bg-gray-800/90 p-3 rounded-lg border border-gray-700">
        <h4 className="text-xs font-bold text-gray-300 mb-2">STATUS</h4>
        <div className="text-xs text-gray-400 space-y-1">
          <div>Tick: {state.tick}</div>
          <div>Time: {Math.floor(state.currentTime / 1000)}s</div>
          <div>Alerts: {state.alerts.length}</div>
          <div className="text-red-400">
            Infected: {state.topology.devices.filter(d => d.status === 'compromised').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkCanvas;
