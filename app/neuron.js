/* global _ */

var Neuron = null;

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

    self.threshold = 1;
    
    // It takes (1/dissipationRate) ms to drain 1 point of activity.
    self.activityDissipationRate = 1 / 20;
    
    self.refractory = {
      duration: 10,
      timeComplete: 0
    };

    /// Postsynaptic target neurons, indexed by their serial numbers.
    /// Each entry is of the format:
    /// <serial>: {neuron: <Neuron>, strength: <number>}
    self.targets = {};

    self.lastTime = null;
    self.isBeingTouched = false;
    
    self.spikeTimeHistory = [];
    self.spikeTimeHistoryWindow = 1000;
    
    self.activity = 0;
  };
  
  Neuron.prototype.strength = function(otherNeuron, spread) {
    var deltap = Math.abs(this.layerPosition.fraction - otherNeuron.layerPosition.fraction);
    var strength = Math.max(0, 1.0 - deltap/spread);
    return strength;
  };
  
  Neuron.prototype.projectToNeuron = function(otherNeuron, strength) {
    this.targets[otherNeuron.serial] = {
      neuron: otherNeuron,
      strength: strength
    };
  };
  
  Neuron.prototype.projectToLayer = function(otherLayer, baseStrength, spread) {
    let self = this;
    _.each(otherLayer, function(otherNeuron) {
      let strength = baseStrength * self.strength(otherNeuron, spread);
      self.projectToNeuron(otherNeuron, strength);
    });
  };
  
  Neuron.prototype.shouldFire = function() {
    return this.activity > this.threshold;
  };
  
  Neuron.prototype.fire = function() {
    this.activity = 0;
    _.each(this.targets, function(target) {
      target.neuron.receiveStimulus(target.strength);
    });

    this.spikeTimeHistory.push(this.lastTime);

    this.refractory.timeComplete = this.lastTime + this.refractory.duration;
  };
  
  Neuron.prototype.spikesPerSecond = function() {
    let hertz = 1000 * this.spikeTimeHistory.length / this.spikeTimeHistoryWindow;
    return hertz;
  };
  
  Neuron.prototype.receiveStimulus = function(stimAmount) {
    if (this.lastTime < this.refractory.timeComplete) {
      // Can't receive stimulus during refractory period.
      stimAmount = 0;
    }
    
    this.activity += stimAmount;
    return this.activity;
  };
  
  Neuron.prototype.doTimeStep = function(newTime) {
    if (!this.lastTime) {
      this.lastTime = newTime;
      return;
    }
    
    let msStep = newTime - this.lastTime;
    this.activity -= this.activityDissipationRate * msStep;
    
    if (this.activity < 0) {
      this.activity = 0;
    }
    
    let historyCutoff = newTime - this.spikeTimeHistoryWindow;
    this.spikeTimeHistory = _.filter(this.spikeTimeHistory, function(spikeTime) {
      return spikeTime > historyCutoff;
    });
    
    this.lastTime = newTime;
  };
  
}());
