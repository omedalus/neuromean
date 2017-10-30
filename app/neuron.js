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
  
  Neuron.prototype.projectToLayer = function(otherLayer, baseStrength, spread, invert) {
    let self = this;
    _.each(otherLayer, function(otherNeuron) {
      let strength = baseStrength;
      if (_.isNumber(spread)) {
        strength *= self.strength(otherNeuron, spread);
      }
      if (invert) {
        strength = 1 - strength;
      }
      self.projectToNeuron(otherNeuron, strength);
    });
  };
  
  Neuron.projectLayerToLayer = function(fromLayer, toLayer, baseStrength, spread, invert) {
    _.each(fromLayer, function(neuron) {
      neuron.projectToLayer(toLayer, baseStrength, spread, invert);
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
    this.activity = Math.min(1, Math.max(0, this.activityNext));
    this.activityNext = -this.threshold;
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
    this.threshold = 0;
    this.isBeingTouched = false;
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




let OutputNeuron = null;

(function() {
  OutputNeuron = function(nerve, iInLayer, nInLayer) {
    Neuron.call(this, 'output', iInLayer, nInLayer);
    this.nerve = nerve;
  };
  
  OutputNeuron.prototype = new Neuron;
  
  OutputNeuron.createLayer = function(nerve, numNeuronsInLayer) {
    let layer = new Array(numNeuronsInLayer);
    _.times(numNeuronsInLayer, function(iInLayer) {
      let neuron = new OutputNeuron(nerve, iInLayer, numNeuronsInLayer);
      layer[iInLayer] = neuron;
    });    
    return layer;
  };
  
  OutputNeuron.prototype.innervateFromLayer = function(layer, baseStrength, reverse) {
    let self = this;
    let numInputs = Math.ceil(layer.length * (1 - this.layerPosition.fraction));
    _.times(numInputs, function(iInput) {
      let input = reverse ? layer[layer.length - iInput - 1] : layer[iInput];
      input.projectToNeuron(self, baseStrength);
    });
  };
  
  OutputNeuron.innervateLayerFromLayer = function(targetLayer, sourceLayer, baseStrength, reverse) {
    _.each(targetLayer, function(targetNeuron) {
      targetNeuron.innervateFromLayer(sourceLayer, baseStrength, reverse);
    });
  };
  
  OutputNeuron.computeOverlapLength = function(n1, n2) {
    let n1Length = 1 - n1.layerPosition.fraction;
    let n2Length = 1 - n2.layerPosition.fraction;
    
    if (n1Length <= 0 || n2Length <= 0) {
      return 0;
    }
    
    let overlapLength = Math.max(0, n1Length + n2Length - 1);
    if (overlapLength <= 0) {
      return 0;
    }
    
    return overlapLength;
  };
  
  OutputNeuron.prototype.computeOverlapLength = function(otherNeuron) {
    return OutputNeuron.computeOverlapLength(this, otherNeuron);
  };
  
  OutputNeuron.prototype.relativeFractionOfSpanInhibitedBy = function(otherNeuron, gracelength) {
    let overlapLength = this.computeOverlapLength(otherNeuron);
    overlapLength = Math.max(0, overlapLength - gracelength);
    if (overlapLength <= 0) {
      return 0;
    }
    
    let relative = overlapLength / this.layerPosition.fraction;

    // relative should NEVER be >1, and should throw an error
    // if it is. But with floating point math, who knows. Best to be careful.
    relative = Math.min(1, relative);
    return relative;
  };
  
  OutputNeuron.prototype.drawPosition = function() {
    let nerveX = {
      lovn: 120,
      tn: 720
    };    
    return {
      x: nerveX[this.nerve] || 470,
      y: 200 + this.layerPosition.index * 10
    };
  };

}());



let GlobalNeuron = null;

(function() {
  GlobalNeuron = function(layerName) {
    Neuron.call(this, layerName, 0, 1);
    this.layerPosition.fraction = .5;
  };
  
  GlobalNeuron.prototype = new Neuron;
  
  GlobalNeuron.createLayer = function(layerName) {
    let layer = [new GlobalNeuron(layerName)];
    return layer;
  };
  
  GlobalNeuron.prototype.drawPosition = function() {
    return {
      x: 425,
      y: 300
    };
  };

}());

