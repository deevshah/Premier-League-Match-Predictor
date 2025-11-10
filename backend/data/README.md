# Data Directory

This directory contains the trained model and reference data needed for predictions.

## Required Files

1. **model.joblib** - Your trained machine learning model (serialized with joblib)
2. **feature_meta.json** - Metadata about features used in training
3. **features_reference.csv** - Latest team statistics for building feature vectors

## Generating These Files

Run your training notebook locally to generate these files:

```python
import joblib
import json
import pandas as pd

# After training your model
joblib.dump(model, 'model.joblib')

# Save feature metadata
feature_meta = {
    "feature_columns": list(feature_columns),
    "preprocessing": "details about preprocessing",
    # ... other metadata
}
with open('feature_meta.json', 'w') as f:
    json.dump(feature_meta, f, indent=2)

# Save reference data
team_stats.to_csv('features_reference.csv', index=False)
```

## Notes

- The placeholder files here are examples only
- Replace them with your actual trained model and data
- Ensure feature order matches your training pipeline
- Update reference data periodically with latest team statistics
