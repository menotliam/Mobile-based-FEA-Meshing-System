import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import Svg, { Rect, Line, Circle, Text as SvgText } from 'react-native-svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

const DEFAULT_ERROR = '';

export default function GeometryEditor({ onBack, onNext }) {
  const [meshingModalVisible, setMeshingModalVisible] = useState(false);
  const [meshingLevel, setMeshingLevel] = useState('Medium');
  const [nx, setNx] = useState('5');
  const [ny, setNy] = useState('1');
  const [minAngle, setMinAngle] = useState('28.5');
  const [maxArea, setMaxArea] = useState('0.05');
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  const [isDrawingRect, setIsDrawingRect] = useState(true);
  const [isShapeCreated, setIsShapeCreated] = useState(false);
  const [rectWidth, setRectWidth] = useState('2.0');
  const [rectHeight, setRectHeight] = useState('1.0');
  const [coordinates, setCoordinates] = useState([]);
  const [validationError, setValidationError] = useState(DEFAULT_ERROR);

  const [youngModulus, setYoungModulus] = useState('20e9');
  const [poissonRatio, setPoissonRatio] = useState('0.3');
  const [thickness, setThickness] = useState('0.1');
  const [pressure, setPressure] = useState('10000');

  const parseNumber = (value) => {
    const parsed = Number(String(value).trim());
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  const parsePositiveNumber = (value, fallback = 1) => {
    const parsed = parseNumber(value);
    return parsed > 0 ? parsed : fallback;
  };

  const parsePositiveInteger = (value) => {
    const parsed = Number(String(value).trim());
    return Number.isInteger(parsed) && parsed > 0 ? parsed : NaN;
  };

  const validateRectangle = () => {
    const width = parseNumber(rectWidth);
    const height = parseNumber(rectHeight);

    if (!Number.isFinite(width) || width <= 0) {
      return { valid: false, message: 'Rectangle width must be a positive number.' };
    }
    if (!Number.isFinite(height) || height <= 0) {
      return { valid: false, message: 'Rectangle height must be a positive number.' };
    }

    return { valid: true, width, height };
  };

  const validateSimulationInputs = () => {
    const rectangle = validateRectangle();
    if (!rectangle.valid) return rectangle;

    const E = parseNumber(youngModulus);
    const nu = parseNumber(poissonRatio);
    const t = parseNumber(thickness);
    const load = parseNumber(pressure);
    const nxValue = parsePositiveInteger(nx);
    const nyValue = parsePositiveInteger(ny);
    const minAngleValue = parseNumber(minAngle);
    const maxAreaValue = parseNumber(maxArea);

    if (!Number.isFinite(E) || E <= 0) {
      return { valid: false, message: "Young's modulus must be greater than 0. Example: 20e9." };
    }
    if (!Number.isFinite(nu) || nu <= 0 || nu >= 0.5) {
      return { valid: false, message: "Poisson's ratio must be between 0 and 0.5 for the current demo." };
    }
    if (!Number.isFinite(t) || t <= 0) {
      return { valid: false, message: 'Thickness must be greater than 0.' };
    }
    if (!Number.isFinite(load) || load <= 0) {
      return { valid: false, message: 'Point load magnitude must be greater than 0.' };
    }
    if (!Number.isFinite(nxValue)) {
      return { valid: false, message: 'NX must be a positive integer.' };
    }
    if (!Number.isFinite(nyValue)) {
      return { valid: false, message: 'NY must be a positive integer.' };
    }
    if (!Number.isFinite(minAngleValue) || minAngleValue <= 0) {
      return { valid: false, message: 'Minimum angle must be greater than 0.' };
    }
    if (!Number.isFinite(maxAreaValue) || maxAreaValue <= 0) {
      return { valid: false, message: 'Maximum area must be greater than 0.' };
    }

    return {
      valid: true,
      values: {
        width: rectangle.width,
        height: rectangle.height,
        youngModulus: E,
        poissonRatio: nu,
        thickness: t,
        pressure: load,
        nx: nxValue,
        ny: nyValue,
        minAngle: minAngleValue,
        maxArea: maxAreaValue,
      },
    };
  };

  const handleCreateRectangle = () => {
    const rectangle = validateRectangle();
    if (!rectangle.valid) {
      setValidationError(rectangle.message);
      return;
    }

    setValidationError(DEFAULT_ERROR);
    setCoordinates([
      [0, 0],
      [rectangle.width, 0],
      [rectangle.width, rectangle.height],
      [0, rectangle.height],
    ]);
    setIsShapeCreated(true);
  };

  const handleStartMeshing = () => {
    const validation = validateSimulationInputs();
    if (!validation.valid) {
      setValidationError(validation.message);
      return;
    }

    const values = validation.values;
    const meshingData = {
      shape: 'Rectangle',
      dimensions: { width: values.width, height: values.height },
      coordinates,
      physics: {
        youngModulus: values.youngModulus,
        poissonRatio: values.poissonRatio,
        thickness: values.thickness,
        pressure: values.pressure,
      },
      meshingConfig: {
        level: meshingLevel,
        nx: values.nx,
        ny: values.ny,
        minAngle: values.minAngle,
        maxArea: values.maxArea,
      },
    };

    setValidationError(DEFAULT_ERROR);
    setMeshingModalVisible(false);
    onNext(meshingData);
  };

  const buildAxisTicks = (maxValue, divisions = 4) => {
    const safeMax = parsePositiveNumber(maxValue, 1);
    const step = safeMax / divisions;
    return Array.from({ length: divisions + 1 }, (_, i) => Number((step * i).toFixed(2)));
  };

  const widthValue = parsePositiveNumber(rectWidth, 1);
  const heightValue = parsePositiveNumber(rectHeight, 1);
  const xTicks = buildAxisTicks(rectWidth, 4);
  const yTicks = buildAxisTicks(rectHeight, 4);

  const renderValidationCard = () => {
    if (!validationError) return null;
    return (
      <View style={styles.validationCard}>
        <Feather name="alert-circle" size={18} color="#DC2626" />
        <Text style={styles.validationText}>{validationError}</Text>
      </View>
    );
  };

  const renderAxisMatchedPreview = () => {
    const viewWidth = 320;
    const viewHeight = 220;
    const paddingLeft = 34;
    const paddingRight = 12;
    const paddingTop = 12;
    const paddingBottom = 28;
    const plotWidth = viewWidth - paddingLeft - paddingRight;
    const plotHeight = viewHeight - paddingTop - paddingBottom;

    const toX = (x) => paddingLeft + (x / widthValue) * plotWidth;
    const toY = (y) => paddingTop + (1 - y / heightValue) * plotHeight;

    return (
      <View style={styles.axisPreviewCard}>
        <Svg width="100%" height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
          {xTicks.map((tick) => (
            <Line key={`grid-x-${tick}`} x1={toX(tick)} y1={paddingTop} x2={toX(tick)} y2={paddingTop + plotHeight} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2 2" />
          ))}
          {yTicks.map((tick) => (
            <Line key={`grid-y-${tick}`} x1={paddingLeft} y1={toY(tick)} x2={paddingLeft + plotWidth} y2={toY(tick)} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2 2" />
          ))}
          <Line x1={paddingLeft} y1={paddingTop + plotHeight} x2={paddingLeft + plotWidth} y2={paddingTop + plotHeight} stroke="#111827" strokeWidth="1.2" />
          <Line x1={paddingLeft} y1={paddingTop + plotHeight} x2={paddingLeft} y2={paddingTop} stroke="#111827" strokeWidth="1.2" />
          <Rect x={toX(0)} y={toY(heightValue)} width={plotWidth} height={plotHeight} fill="rgba(37, 99, 235, 0.10)" stroke="#2563EB" strokeWidth="2" rx="2" />
          <Circle cx={toX(0)} cy={toY(0)} r="2.2" fill="#1D4ED8" />
          <Circle cx={toX(widthValue)} cy={toY(0)} r="2.2" fill="#1D4ED8" />
          <Circle cx={toX(widthValue)} cy={toY(heightValue)} r="2.2" fill="#1D4ED8" />
          <Circle cx={toX(0)} cy={toY(heightValue)} r="2.2" fill="#1D4ED8" />
          {xTicks.map((tick) => (
            <SvgText key={`x-lbl-${tick}`} x={toX(tick)} y={paddingTop + plotHeight + 16} fill="#4B5563" fontSize="9" textAnchor="middle">{tick}m</SvgText>
          ))}
          {[...yTicks].reverse().map((tick) => (
            <SvgText key={`y-lbl-${tick}`} x={paddingLeft - 8} y={toY(tick) + 3} fill="#4B5563" fontSize="9" textAnchor="end">{tick}m</SvgText>
          ))}
        </Svg>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 12 : 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Geometry Editor</Text>
          <Text style={styles.headerSubtitle}>STEP 2: DEFINE PROFILES</Text>
        </View>
        <TouchableOpacity style={styles.inspectButton}>
          <Feather name="check-circle" size={16} color="#333" />
          <Text style={styles.inspectText}>Inspect</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.workspaceContainer}>
        <View style={styles.drawingArea}>
          <View style={styles.canvasBoundary}>
            {isDrawingRect ? (
              !isShapeCreated ? (
                <View style={styles.centerPromptBox}>
                  <MaterialCommunityIcons name="shape-rectangle-plus" size={36} color="#1D4ED8" style={styles.promptIcon} />
                  <Text style={styles.promptTitle}>Rectangle Dimensions</Text>
                  <Text style={styles.promptDesc}>Enter the width and height of your rectangle surface.</Text>
                  {renderValidationCard()}
                  <View style={styles.dimRow}>
                    <View style={styles.dimInputWrapper}>
                      <Text style={styles.dimLabel}>Width (W)</Text>
                      <View style={styles.dimInputContainer}>
                        <TextInput style={styles.dimInput} value={rectWidth} onChangeText={(value) => { setRectWidth(value); setValidationError(DEFAULT_ERROR); }} keyboardType="numeric" />
                        <Text style={styles.dimUnit}>m</Text>
                      </View>
                    </View>
                    <View style={styles.dimSpacer} />
                    <View style={styles.dimInputWrapper}>
                      <Text style={styles.dimLabel}>Height (H)</Text>
                      <View style={styles.dimInputContainer}>
                        <TextInput style={styles.dimInput} value={rectHeight} onChangeText={(value) => { setRectHeight(value); setValidationError(DEFAULT_ERROR); }} keyboardType="numeric" />
                        <Text style={styles.dimUnit}>m</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.createShapeBtn} onPress={handleCreateRectangle}>
                    <Text style={styles.createShapeBtnText}>Create Rectangle</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.drawnShapeContainer}>
                  {renderAxisMatchedPreview()}
                  <View style={styles.drawnDimensions}>
                    <Text style={styles.drawnDimText}>W: {rectWidth}m</Text>
                    <Text style={styles.drawnDimText}>H: {rectHeight}m</Text>
                  </View>
                  <View style={styles.coordinateCard}>
                    <Text style={styles.coordinateTitle}>Generated Node Coordinates:</Text>
                    <Text style={styles.coordinateText}>P1: (0, 0)        P2: ({rectWidth}, 0)</Text>
                    <Text style={styles.coordinateText}>P3: ({rectWidth}, {rectHeight})    P4: (0, {rectHeight})</Text>
                  </View>
                  <TouchableOpacity style={styles.resetShapeBtn} onPress={() => { setIsShapeCreated(false); setValidationError(DEFAULT_ERROR); }}>
                    <Feather name="refresh-cw" size={14} color="#6B7280" />
                    <Text style={styles.resetShapeText}>Reset Shape</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.mainNextButton} onPress={() => { setValidationError(DEFAULT_ERROR); setMeshingModalVisible(true); }}>
                    <Text style={styles.mainNextText}>Next: Physical Parameters</Text>
                    <Feather name="arrow-right" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              )
            ) : (
              <View style={styles.centerPromptBox}>
                <Ionicons name="compass-outline" size={32} color="#1D4ED8" style={styles.promptIcon} />
                <Text style={styles.promptTitle}>Workspace</Text>
                <Text style={styles.promptDesc}>Circle and imported geometry are target features. Use rectangle for the current academic demo.</Text>
                <Text style={styles.coordinates}>X:  0.00    Y:  0.00</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.bottomToolbar}>
        <TouchableOpacity style={styles.toolbarAction} onPress={() => setIsDrawingRect(true)}>
          <MaterialCommunityIcons name="shape-rectangle-plus" size={24} color={isDrawingRect ? '#1D4ED8' : '#666'} />
          <Text style={[styles.toolbarText, isDrawingRect && styles.toolbarTextActive]}>Rectangle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarAction} onPress={() => setIsDrawingRect(false)}>
          <MaterialCommunityIcons name="circle-outline" size={24} color={!isDrawingRect ? '#1D4ED8' : '#666'} />
          <Text style={[styles.toolbarText, !isDrawingRect && styles.toolbarTextActive]}>Circle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarAction}>
          <Feather name="file-plus" size={24} color="#666" />
          <Text style={styles.toolbarText}>Import Data</Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" transparent visible={meshingModalVisible} onRequestClose={() => setMeshingModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Meshing & Physics Parameters</Text>
              <TouchableOpacity onPress={() => setMeshingModalVisible(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {renderValidationCard()}

              <View style={styles.physicsSection}>
                <Text style={styles.sectionLabel}>Material & Load</Text>
                <View style={styles.physicsGrid}>
                  <View style={styles.physicsItem}>
                    <Text style={styles.physicsLabel}>Young's Modulus (E)</Text>
                    <View style={styles.physicsInputBox}>
                      <TextInput style={styles.physicsInput} value={youngModulus} onChangeText={(value) => { setYoungModulus(value); setValidationError(DEFAULT_ERROR); }} keyboardType="default" />
                      <Text style={styles.physicsUnit}>Pa</Text>
                    </View>
                  </View>
                  <View style={styles.physicsItem}>
                    <Text style={styles.physicsLabel}>Poisson's Ratio (ν)</Text>
                    <View style={styles.physicsInputBox}>
                      <TextInput style={styles.physicsInput} value={poissonRatio} onChangeText={(value) => { setPoissonRatio(value); setValidationError(DEFAULT_ERROR); }} keyboardType="numeric" />
                    </View>
                  </View>
                </View>

                <View style={styles.physicsGrid}>
                  <View style={styles.physicsItem}>
                    <Text style={styles.physicsLabel}>Thickness (t)</Text>
                    <View style={styles.physicsInputBox}>
                      <TextInput style={styles.physicsInput} value={thickness} onChangeText={(value) => { setThickness(value); setValidationError(DEFAULT_ERROR); }} keyboardType="numeric" />
                      <Text style={styles.physicsUnit}>m</Text>
                    </View>
                  </View>
                  <View style={styles.physicsItem}>
                    <Text style={styles.physicsLabel}>Point Load Magnitude</Text>
                    <View style={styles.physicsInputBox}>
                      <TextInput style={styles.physicsInput} value={pressure} onChangeText={(value) => { setPressure(value); setValidationError(DEFAULT_ERROR); }} keyboardType="numeric" />
                      <Text style={styles.physicsUnit}>N</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.levelSelector}>
                <Text style={styles.sectionLabel}>Meshing Level</Text>
                <View style={styles.segmentedControl}>
                  {['Coarse', 'Medium', 'Fine'].map((level) => (
                    <TouchableOpacity key={level} style={[styles.segment, meshingLevel === level && styles.segmentActive]} onPress={() => setMeshingLevel(level)}>
                      <Text style={[styles.segmentText, meshingLevel === level && styles.segmentTextActive]}>{level}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.physicsSection}>
                <Text style={styles.sectionLabel}>Mesh Density</Text>
                <View style={styles.physicsGrid}>
                  <View style={styles.physicsItem}>
                    <Text style={styles.physicsLabel}>NX (X elements)</Text>
                    <View style={styles.physicsInputBox}>
                      <TextInput style={styles.physicsInput} value={nx} onChangeText={(value) => { setNx(value); setValidationError(DEFAULT_ERROR); }} keyboardType="number-pad" />
                    </View>
                  </View>
                  <View style={styles.physicsItem}>
                    <Text style={styles.physicsLabel}>NY (Y elements)</Text>
                    <View style={styles.physicsInputBox}>
                      <TextInput style={styles.physicsInput} value={ny} onChangeText={(value) => { setNy(value); setValidationError(DEFAULT_ERROR); }} keyboardType="number-pad" />
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.advancedConfig}>
                <TouchableOpacity style={styles.advancedHeader} onPress={() => setAdvancedExpanded(!advancedExpanded)}>
                  <View style={styles.advancedTitleRow}>
                    <Feather name="settings" size={16} color="#1D4ED8" />
                    <Text style={styles.advancedHeaderText}>Advanced Meshing Config</Text>
                  </View>
                  <Feather name={advancedExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#666" />
                </TouchableOpacity>

                {advancedExpanded && (
                  <View style={styles.advancedBody}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Minimum Angle (minAngleDeg)</Text>
                      <View style={styles.textInputContainer}>
                        <TextInput style={styles.textInput} value={minAngle} onChangeText={(value) => { setMinAngle(value); setValidationError(DEFAULT_ERROR); }} keyboardType="numeric" />
                        <Text style={styles.unitText}>°</Text>
                      </View>
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Maximum Area (maxArea)</Text>
                      <View style={styles.textInputContainer}>
                        <TextInput style={styles.textInput} value={maxArea} onChangeText={(value) => { setMaxArea(value); setValidationError(DEFAULT_ERROR); }} keyboardType="numeric" />
                        <Text style={styles.unitText}>m²</Text>
                      </View>
                      <Text style={styles.helperText}>Lower values target denser meshes in future meshing modes.</Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.startButton} onPress={handleStartMeshing}>
              <Feather name="play-circle" size={20} color="#fff" />
              <Text style={styles.startButtonText}>Start Generation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#fff', zIndex: 10, elevation: 3 },
  backButton: { marginRight: 16 },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 11, color: '#6B7280', fontWeight: '600', marginTop: 2 },
  inspectButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 10 },
  inspectText: { fontSize: 14, marginLeft: 6, color: '#374151', fontWeight: '500' },
  workspaceContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  drawingArea: { flex: 1, padding: 20 },
  canvasBoundary: { flex: 1, borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 8, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  centerPromptBox: { width: 300, backgroundColor: '#fff', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3, alignItems: 'center' },
  promptIcon: { alignSelf: 'center', marginBottom: 12 },
  promptTitle: { fontSize: 18, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  promptDesc: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 18, marginBottom: 18 },
  validationCard: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 10, padding: 12, marginBottom: 14 },
  validationText: { flex: 1, marginLeft: 8, color: '#991B1B', fontSize: 13, lineHeight: 18, fontWeight: '600' },
  dimRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  dimSpacer: { width: 16 },
  dimInputWrapper: { flex: 1 },
  dimLabel: { fontSize: 12, fontWeight: '700', color: '#4B5563', marginBottom: 6 },
  dimInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: '#F9FAFB' },
  dimInput: { flex: 1, fontSize: 16, fontWeight: '600', color: '#111827' },
  dimUnit: { fontSize: 14, color: '#9CA3AF', fontWeight: '500', marginLeft: 8 },
  createShapeBtn: { backgroundColor: '#1D4ED8', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 8, alignItems: 'center', marginTop: 24, width: '100%' },
  createShapeBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  drawnShapeContainer: { alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' },
  axisPreviewCard: { width: '100%', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, backgroundColor: '#F9FAFB', marginBottom: 14, overflow: 'hidden' },
  drawnDimensions: { flexDirection: 'row', gap: 16, marginBottom: 18 },
  drawnDimText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  coordinateCard: { backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8, marginBottom: 16, width: '100%' },
  coordinateTitle: { fontSize: 12, color: '#4B5563', fontWeight: 'bold', marginBottom: 4 },
  coordinateText: { fontSize: 12, color: '#374151', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  resetShapeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#F3F4F6', borderRadius: 8, marginBottom: 16 },
  resetShapeText: { color: '#6B7280', fontSize: 14, fontWeight: '500' },
  mainNextButton: { backgroundColor: '#1D4ED8', flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8, marginTop: 8, width: '100%', justifyContent: 'center', gap: 8 },
  mainNextText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  coordinates: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', fontFamily: 'monospace' },
  bottomToolbar: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#fff', paddingVertical: 12, paddingBottom: 24 },
  toolbarAction: { alignItems: 'center' },
  toolbarText: { fontSize: 12, color: '#6B7280', marginTop: 6, fontWeight: '500' },
  toolbarTextActive: { color: '#1D4ED8', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12, height: '80%' },
  modalHandle: { width: 40, height: 4, backgroundColor: '#D1D5DB', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  modalScroll: { marginBottom: 20 },
  physicsSection: { marginBottom: 12 },
  physicsGrid: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  physicsItem: { flex: 1 },
  physicsLabel: { fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 6 },
  physicsInputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 10, height: 40, backgroundColor: '#F9FAFB' },
  physicsInput: { flex: 1, fontSize: 14, color: '#111827' },
  physicsUnit: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginLeft: 4 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
  levelSelector: { marginBottom: 24 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12 },
  segmentedControl: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 4 },
  segment: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  segmentActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  segmentText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  segmentTextActive: { color: '#1D4ED8', fontWeight: '600' },
  advancedConfig: { marginBottom: 30 },
  advancedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  advancedTitleRow: { flexDirection: 'row', alignItems: 'center' },
  advancedHeaderText: { fontSize: 14, fontWeight: '600', color: '#111827', marginLeft: 8 },
  advancedBody: { paddingTop: 12 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, color: '#374151', marginBottom: 8 },
  textInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12 },
  textInput: { flex: 1, height: 44, fontSize: 16, color: '#111827' },
  unitText: { fontSize: 14, color: '#6B7280' },
  helperText: { fontSize: 12, color: '#9CA3AF', marginTop: 8 },
  startButton: { backgroundColor: '#1D4ED8', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 8, marginTop: 'auto' },
  startButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
});
