export default function maceEngineRegistry() {
  return {
    id:'mace',label:'MACE',deployment:'input_file',availability:'local',
    sim_types:['dft','quantum_mechanics','molecular_dynamics','materials','surface_chemistry'],
    methods:['MACE-OFF23','MACE-MP-0'],tasks:['Single-point energy','Geometry optimization','Molecular dynamics'],
    version:'Recorded from installed mace-torch and ASE when the script runs.',
    docs_url:'https://mace-docs.readthedocs.io/en/latest/guide/foundation_models.html',
    license:'MACE code and MACE-MP-0: MIT. MACE-OFF23 checkpoints: Academic Software License; review commercial-use restrictions.',
    citation:'Batatia et al. MACE (NeurIPS 2022). Cite the selected foundation model: MACE-MP-0, arXiv:2401.00096; MACE-OFF23, arXiv:2312.15211. Also cite ASE and the installed software versions.',
    endpoint:'generateMaceInputs',hosting_note:'Generates ASE + mace-torch scripts for local execution. ML-potential predictions, not fresh DFT calculations or hosted compute.',
    parameter_schema:{type:'object',required:['sim_type','inputs'],properties:{
      sim_type:{type:'string'},record_job:{type:'boolean'},
      inputs:{type:'object',properties:{
        geometry_xyz:{type:'string'},engine_method:{enum:['MACE-OFF23','MACE-MP-0']},engine_task:{enum:['Single-point energy','Geometry optimization','Molecular dynamics']},
        mace_device:{enum:['cpu','cuda']},mace_periodic:{type:'boolean'},cell:{type:'string'},
        mace_fmax:{type:'number',minimum:0.0001,maximum:1},mace_opt_steps:{type:'integer',minimum:1,maximum:10000},
        mace_ensemble:{enum:['NVE','NVT']},mace_temperature:{type:'number',minimum:1,maximum:5000},mace_steps:{type:'integer',minimum:1,maximum:1000000},mace_timestep_fs:{type:'number',minimum:0.01,maximum:5}
      }}
    }},
    example:{sim_type:'molecular_dynamics',engine:'MACE',inputs:{geometry_xyz:'3\nWater\nO 0 0 0\nH 0 0 0.9572\nH 0.9266 0 -0.2396',engine_method:'MACE-OFF23',engine_task:'Molecular dynamics',mace_ensemble:'NVT',mace_temperature:300,mace_steps:1000,mace_timestep_fs:0.5},record_job:false}
  };
}