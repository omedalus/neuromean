/* global _ */

let Neuron = null;

(function() {
  var neuronSerialNum = 1;
  
  Neuron = function(layerId, iInLayer, nInLayer) {
    var self = this;
    self.serial = neuronSerialNum;
    neuronSerialNum++;
    
    self.layer = layerId;
    self.layerPosition = {
      index: iInLayer,
      fraction: (nInLayer > 1) ? (iInLayer / (nInLayer - 1)) : .5
    };

    /// Postsynaptic target neurons, indexed by their serial numbers.
    /// Each entry is of the format:
    /// <serial>: {neuron: <Neuron>, strength: <number>}
    self.targets = {};

    self.threshold = 0;

    self.isBeingTouched = false;
    self.activity = 0;
    self.activityNext = 0;
  };
  
  Neuron.createLayer = function(layerName, numNeuronsInLayer) {
    let layer = new Array(numNeuronsInLayer);
    _.times(numNeuronsInLayer, function(iInLayer) {
      let neuron = new Neuron(layerName, iInLayer, numNeuronsInLayer);
      layer[iInLayer] = neuron;
    });    
    return layer;
  };
  
  Neuron.prototype.strength = function(otherNeuron, spread) {
    var deltap = Math.abs(this.layerPosition.fraction - otherNeuron.layerPosition.fraction);
    var strength = Math.max(0, 1.0 - deltap/spread);
    return strength;
  };
  
  Neuron.prototype.projectToNeuron = function(otherNeuron, strength) {
    if (otherNeuron === this) {
      // No self-stimulation allowed! This is a Catholic neural net!
      return;
    }
    
    this.targets[otherNeuron.serial] = {
      neuron: otherNeuron,
      strength: strength
    };
  };
  
  Neuron.prototype.projectToLayer = function(otherLayer, baseStrength, spread) {
    let self = this;
    _.each(otherLayer, function(otherNeuron) {
      let strength = baseStrength;
      if (_.isNumber(spread)) {
        strength *= self.strength(otherNeuron, spread);
      }
      self.projectToNeuron(otherNeuron, strength);
    });
  };
  
  Neuron.projectLayerToLayer = function(fromLayer, toLayer, baseStrength, spread) {
    _.each(fromLayer, function(neuron) {
      neuron.projectToLayer(toLayer, baseStrength, spread);
    });
  };
  
  Neuron.prototype.receiveStimulus = function(stimAmount) {
    this.activityNext += stimAmount;
    return this.activityNext;
  };
  
  Neuron.prototype.propagateActivity = function() {
    let self = this;
    _.each(self.targets, function(target) {
      target.neuron.receiveStimulus(target.strength * self.activity);
    });
  };
  
  Neuron.prototype.doTimeStep = function(newTime) {
    this.activityNext -= this.threshold;
    this.activity = Math.min(1, Math.max(0, this.activityNext));
    this.activityNext = 0;
  };
  
  
  Neuron.prototype.drawPosition = function() {
    return {
      x: 0,
      y: 0
    };
  };
}());



let SensorNeuron = null;

(function() {
  SensorNeuron = function(iInLayer, nInLayer) {
    Neuron.call(this, 'sensor', iInLayer, nInLayer);
  };
  
  SensorNeuron.prototype = new Neuron;
  
  SensorNeuron.createLayer = function(numNeuronsInLayer) {
    let layer = new Array(numNeuronsInLayer);
    _.times(numNeuronsInLayer, function(iInLayer) {
      let neuron = new SensorNeuron(iInLayer, numNeuronsInLayer);
      layer[iInLayer] = neuron;
    });    
    return layer;
  };
  
  SensorNeuron.prototype.drawPosition = function() {
    let f = this.layerPosition.fraction;
    let xStart = 40;
    let xEnd = 900;
    let yBottom = 120;
    let yRise = 60;
    let xNorm = (2 * f) - 1;
    return {
      x: ((xEnd - xStart) * f)  + xStart,
      y: yBottom - yRise * xNorm * xNorm
    };
  };
}());



